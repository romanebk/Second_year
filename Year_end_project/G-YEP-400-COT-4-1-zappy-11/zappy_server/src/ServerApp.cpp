/*
** EPITECH PROJECT, 2026
** ServerApp.cpp
** File description:
** Server application
*/#include "../include/ServerApp.hpp"
#include "../include/game/Map.hpp"
#include "../include/game/Player.hpp"
#include "../include/game/Egg.hpp"
#include "../include/game/CommandUtils.hpp"
#include "../include/protocol/AIProtocol.hpp"
#include "../include/protocol/GUIProtocol.hpp"
#include "../include/game/IncantationSystem.hpp"
#include "../include/common/Constants.hpp"
#include <algorithm>
#include <cstdlib>
#include <ctime>
#include <chrono>

ServerApp::~ServerApp()
{
    stop();
}

bool ServerApp::initNetwork(int port)
{
    return _server.init(port);
}

void ServerApp::init(int width, int height, const std::vector<std::string> &teamNames,
                      int clientsPerTeam, int freq)
{
    _freq = freq;
    _map = std::make_unique<Map>(width, height);
    _resourceManager = std::make_unique<ResourceManager>(*_map);
    _scheduler = std::make_unique<CommandScheduler>(freq);

    for (const auto &name : teamNames)
        _teams.emplace_back(name, clientsPerTeam);

    _resourceManager->setOnSpawn([this](int x, int y) {
        auto &tile = _map->getTile(x, y);
        broadcastToGUI(GUIProtocol::bct(x, y, tile.getResources()));
    });
    _resourceManager->initialize();
    std::srand(static_cast<unsigned>(std::time(nullptr)));

    _actions = std::make_unique<ActionHandler>(
        *_map, _teams, _players, _eggs, _sessions, *_scheduler,
        _incantationParticipants, _pendingEggs, _nextEggId, _freq,
        _gameOver, _winner
    );

    _server.setOnConnect([this](Client &client) { onConnect(client); });
    _server.setOnDisconnect([this](Client &client) { onDisconnect(client); });
    _server.setOnData([this](Client &client) { onData(client); });
    _server.setOnStdinEOF([this]() { stop(); });
    _scheduler->setOnActionReady(
        [this](Player *player, ActionType type, const std::vector<std::string> &args) {
            onActionReady(player, type, args);
        });
}

void ServerApp::run()
{
    if (!_server.isRunning())
        return;

    _running = true;
    broadcastToGUI(GUIProtocol::smg("Server started"));

    while (_running) {
        double wait = getTimeUntilNextEvent();
        int timeoutMs = (wait < 0) ? 1000 : static_cast<int>(wait * 1000);
        if (timeoutMs < 1 && wait > 0)
            timeoutMs = 1;

        auto before = std::chrono::steady_clock::now();
        _server.run(timeoutMs);
        auto after = std::chrono::steady_clock::now();

        double elapsed = std::chrono::duration<double>(after - before).count();
        update(elapsed);
    }
}

void ServerApp::stop()
{
    _running = false;
    _server.stop();
}

void ServerApp::update(double deltaTime)
{
    if (_gameOver)
        return;

    _scheduler->update(deltaTime);

    if (_resourceManager) {
        double spawnInterval = Constants::SPAWN_INTERVAL / static_cast<double>(_freq);
        _resourceTimer += deltaTime;
        while (_resourceTimer >= spawnInterval) {
            _resourceTimer -= spawnInterval;
            _resourceManager->spawn();
        }
    }

    if (!_players.empty()) {
        double foodInterval = Constants::FOOD_UNITS / static_cast<double>(_freq);
        _foodTimer += deltaTime;
        while (_foodTimer >= foodInterval) {
            _foodTimer -= foodInterval;
            std::vector<Player *> deadThisTick;
            for (auto &p : _players) {
                if (p->isDead())
                    continue;
                p->consumeFood();
                if (p->isDead())
                    deadThisTick.push_back(p.get());
            }
            for (auto *p : deadThisTick) {
                auto *client = _actions->getClientByPlayer(*p);
                if (client) {
                    _actions->cancelIncantation(*p);
                    client->pushLine("dead\n");
                    broadcastToGUI(GUIProtocol::pdi(p->getId()));
                    client->disconnect();
                    onDisconnect(*client);
                }
            }
        }
    }

    _actions->checkEggHatches(deltaTime);
}

double ServerApp::getTimeUntilNextEvent() const
{
    double nextAction = _scheduler ? _scheduler->getTimeUntilNextAction() : -1;
    if (nextAction < 0 && _players.empty() && _pendingEggs.empty())
        return -1;

    double spawnInterval = Constants::SPAWN_INTERVAL / static_cast<double>(_freq);
    double remainingSpawn = spawnInterval - _resourceTimer;
    double foodInterval = Constants::FOOD_UNITS / static_cast<double>(_freq);
    double remainingFood = foodInterval - _foodTimer;

    double minTime = std::min(remainingSpawn, remainingFood);
    if (nextAction >= 0)
        minTime = std::min(minTime, nextAction);
    for (const auto &pe : _pendingEggs)
        minTime = std::min(minTime, pe.remainingTime);
    return std::max(0.0, minTime);
}

void ServerApp::onConnect(Client &client)
{
    std::cout << "[CONNECTION] New client connected on fd " << client.getFd() << std::endl;
    auto *session = new Session(client);
    _sessions[client.getFd()] = session;

    session->setOnTeamName([this](Session &s, const std::string &name) { handleTeamJoin(s, name); });
    session->setOnGUI([this](Session &s) { handleGUIConnect(s); });
    session->setOnAICommand([this](Session &s, const std::string &l) { handleAICommand(s, l); });
    session->setOnGUICommand([this](Session &s, const std::string &l) { handleGUICommand(s, l); });

    session->handleWelcome();
}

void ServerApp::onDisconnect(Client &client)
{
    std::cout << "[DISCONNECTION] Client disconnected on fd " << client.getFd() << std::endl;
    auto sit = std::find_if(_sessions.begin(), _sessions.end(),
        [&client](const auto &p) { return &p.second->getClient() == &client; });
    if (sit != _sessions.end()) {
        int playerId = client.getPlayerId();
        if (playerId >= 0) {
            for (auto &team : _teams) {
                for (auto *player : team.getPlayers()) {
                    if (player->getId() == playerId) {
                        if (_actions)
                            _actions->cancelIncantation(*player);
                        for (auto &[initiator, parts] : _incantationParticipants) {
                            (void)initiator;
                            parts.erase(
                                std::remove(parts.begin(), parts.end(), player),
                                parts.end());
                        }
                        player->setIncanting(false);
                        _scheduler->clearPlayerActions(player);
                        _map->getTile(player->getPosition()).removePlayer(player);
                        team.removePlayer(player);
                        break;
                    }
                }
            }
            auto pit = std::find_if(_players.begin(), _players.end(),
                [playerId](const auto &ptr) { return ptr && ptr->getId() == playerId; });
            if (pit != _players.end())
                _players.erase(pit);
        }
        delete sit->second;
        _sessions.erase(sit);
    }
}

void ServerApp::handleTeamJoin(Session &session, const std::string &teamName)
{
    Team *team = getTeam(teamName);
    if (!team) {
        session.getClient().pushLine("ko\n");
        session.getClient().disconnect();
        return;
    }

    Egg *egg = team->getAvailableEgg();
    if (!egg && team->getFreeSlots() <= 0) {
        session.getClient().pushLine("ko\n");
        session.getClient().disconnect();
        return;
    }

    int id = _nextPlayerId++;
    auto newPlayer = std::make_unique<Player>(id, teamName);
    Player *player = newPlayer.get();
    _players.push_back(std::move(newPlayer));
    session.setPlayer(player);
    session.getClient().setPlayerId(id);
    team->addPlayer(player);

    Position spawnPos;
    if (egg) {
        spawnPos = egg->getPosition();
        if (!egg->isHatched())
            egg->hatch();
        _map->getTile(spawnPos).removeEgg(egg);
        egg->consume();
    } else {
        spawnPos = {std::rand() % _map->getWidth(), std::rand() % _map->getHeight()};
    }

    int dir = (std::rand() % 4) + 1;
    player->setOrientation(static_cast<Orientation>(dir));
    player->setPosition(spawnPos);
    _map->getTile(spawnPos).addPlayer(player);
    player->getInventory()[ResourceType::FOOD] = Constants::INITIAL_LIFE;

    session.getClient().pushLine(
        AIProtocol::formatClientNum(team->getFreeSlots()) +
        AIProtocol::formatMapSize(_map->getWidth(), _map->getHeight()));

    broadcastToGUI(GUIProtocol::pnw(id, spawnPos.x, spawnPos.y, dir, player->getLevel(), teamName));
    broadcastToGUI(GUIProtocol::pin(id, spawnPos.x, spawnPos.y, player->getInventory()));
}

void ServerApp::handleGUIConnect(Session &session)
{
    Client &client = session.getClient();
    client.pushLine(GUIProtocol::msz(_map->getWidth(), _map->getHeight()));

    auto tiles = _map->getAllTiles();
    for (auto &tileRef : tiles) {
        auto &tile = tileRef.get();
        client.pushLine(GUIProtocol::bct(tile.getPosition().x, tile.getPosition().y, tile.getResources()));
    }

    for (auto &team : _teams)
        client.pushLine(GUIProtocol::tna(team.getName()));

    for (auto &p : _players) {
        auto &pos = p->getPosition();
        client.pushLine(GUIProtocol::pnw(p->getId(), pos.x, pos.y,
            static_cast<int>(p->getOrientation()), p->getLevel(), p->getTeamName()));
    }

    for (auto &egg : _eggs) {
        if (!egg->isHatched() && !egg->isDead())
            client.pushLine(GUIProtocol::enw(egg->getId(), 0, egg->getPosition().x, egg->getPosition().y));
    }

    client.pushLine(GUIProtocol::sgt(_freq));
}

void ServerApp::handleAICommand(Session &session, const std::string &line)
{
    Player *player = session.getPlayer();
    if (!player) {
        session.getClient().pushLine("ko\n");
        return;
    }

    if (player->isIncanting()) {
        session.getClient().pushLine("ko\n");
        return;
    }

    ParsedAction action = AIProtocol::parse(line);
    if (action.type == ActionType::NONE) {
        session.getClient().pushLine("ko\n");
        return;
    }

    if (action.type == ActionType::INCANTATION) {
        auto *tile = player->getTile();
        int targetLevel = player->getLevel() + 1;
        if (!tile || targetLevel > 8 || !IncantationSystem::checkRequirements(*tile, targetLevel)) {
            session.getClient().pushLine("ko\n");
            return;
        }

        auto participants = IncantationSystem::getEligiblePlayers(*tile, player->getLevel());
        for (auto *p : participants) {
            p->setIncanting(true);
            _scheduler->clearPlayerActions(p);
        }

        _incantationParticipants[player] = participants;

        session.getClient().pushLine(AIProtocol::formatElevationUnderway());

        std::vector<int> ids;
        for (auto *p : participants) ids.push_back(p->getId());
        broadcastToGUI(GUIProtocol::pic(tile->getPosition().x, tile->getPosition().y,
                                         player->getLevel(), ids));

        _scheduler->schedule(player, ActionType::INCANTATION, {});
        return;
    }

    if (!_scheduler->schedule(player, action.type, action.args))
        session.getClient().pushLine("ko\n");
}

void ServerApp::handleGUICommand(Session &session, const std::string &line)
{
    Client &client = session.getClient();
    std::vector<std::string> args;
    auto req = GUIProtocol::parse(line, args);

    try {
        switch (req) {
            case GUIProtocol::Request::MSZ:
                client.pushLine(GUIProtocol::msz(_map->getWidth(), _map->getHeight()));
                break;
            case GUIProtocol::Request::BCT: {
                if (args.size() < 2) { client.pushLine("sbp\n"); break; }
                int x = std::stoi(args[0]);
                int y = std::stoi(args[1]);
                if (x < 0 || x >= _map->getWidth() || y < 0 || y >= _map->getHeight()) {
                    client.pushLine("sbp\n");
                    break;
                }
                auto &tile = _map->getTile(x, y);
                client.pushLine(GUIProtocol::bct(x, y, tile.getResources()));
                break;
            }
            case GUIProtocol::Request::MCT: {
                auto tiles = _map->getAllTiles();
                for (auto &tileRef : tiles) {
                    auto &tile = tileRef.get();
                    auto &pos = tile.getPosition();
                    client.pushLine(GUIProtocol::bct(pos.x, pos.y, tile.getResources()));
                }
                break;
            }
            case GUIProtocol::Request::TNA:
                for (auto &team : _teams)
                    client.pushLine(GUIProtocol::tna(team.getName()));
                break;
            case GUIProtocol::Request::PPO: {
                if (args.size() < 1) { client.pushLine("sbp\n"); break; }
                int id = std::stoi(args[0]);
                Player *p = _actions->findPlayer(id);
                if (p) client.pushLine(GUIProtocol::ppo(id, p->getPosition().x, p->getPosition().y,
                    static_cast<int>(p->getOrientation())));
                else client.pushLine("sbp\n");
                break;
            }
            case GUIProtocol::Request::PLV: {
                if (args.size() < 1) { client.pushLine("sbp\n"); break; }
                int id = std::stoi(args[0]);
                Player *p = _actions->findPlayer(id);
                if (p) client.pushLine(GUIProtocol::plv(id, p->getLevel()));
                else client.pushLine("sbp\n");
                break;
            }
            case GUIProtocol::Request::PIN: {
                if (args.size() < 1) { client.pushLine("sbp\n"); break; }
                int id = std::stoi(args[0]);
                Player *p = _actions->findPlayer(id);
                if (p) client.pushLine(GUIProtocol::pin(id, p->getPosition().x, p->getPosition().y,
                    p->getInventory()));
                else client.pushLine("sbp\n");
                break;
            }
            case GUIProtocol::Request::SGT:
                client.pushLine(GUIProtocol::sgt(_freq));
                break;
            case GUIProtocol::Request::SST: {
                if (args.size() < 1) { client.pushLine("sbp\n"); break; }
                int newFreq = std::stoi(args[0]);
                if (newFreq <= 0) { client.pushLine("sbp\n"); break; }
                _freq = newFreq;
                _scheduler->setFreq(_freq);
                if (_actions)
                    _actions->setFreq(_freq);
                client.pushLine(GUIProtocol::sst(_freq));
                break;
            }
            default:
                client.pushLine("suc\n");
                break;
        }
    } catch (const std::exception &) {
        client.pushLine("sbp\n");
    }
}

void ServerApp::onData(Client &client)
{
    auto it = _sessions.find(client.getOrigFd());
    if (it == _sessions.end())
        return;

    while (client.hasLine()) {
        std::string line = client.popLine();
        std::cout << "[MESSAGE] Received from fd " << client.getFd() << ": " << line << std::endl;
        it->second->handleLine(line);
    }
}

void ServerApp::onActionReady(Player *player, ActionType type,
                               const std::vector<std::string> &args)
{
    if (!player || !_actions)
        return;
    _actions->execute(*player, type, args);
}

Team *ServerApp::getTeam(const std::string &name)
{
    for (auto &team : _teams) {
        if (team.getName() == name)
            return &team;
    }
    return nullptr;
}

void ServerApp::broadcastToGUI(const std::string &msg)
{
    for (auto &[fd, session] : _sessions) {
        (void)fd;
        if (session->isGUI())
            session->getClient().pushLine(msg);
    }
}
