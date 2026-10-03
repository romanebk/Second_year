#include "../include/ServerApp.hpp"
#include "../include/protocol/AIProtocol.hpp"
#include "../include/protocol/GUIProtocol.hpp"
#include "../include/game/LookSystem.hpp"
#include "../include/game/BroadcastSystem.hpp"
#include "../include/game/IncantationSystem.hpp"
#include <algorithm>
#include <cstdlib>
#include <ctime>
#include <chrono>

ServerApp::~ServerApp()
{
    stop();
    delete _map;
    delete _resourceManager;
    delete _scheduler;
}

bool ServerApp::initNetwork(int port)
{
    return _server.init(port);
}

void ServerApp::init(int width, int height, const std::vector<std::string> &teamNames,
                      int clientsPerTeam, int freq)
{
    _freq = freq;
    _map = new Map(width, height);
    _resourceManager = new ResourceManager(*_map);
    _scheduler = new CommandScheduler(freq);

    for (const auto &name : teamNames)
        _teams.emplace_back(name, clientsPerTeam);

    _resourceManager->setOnSpawn([this](int x, int y) {
        auto &tile = _map->getTile(x, y);
        broadcastToGUI(GUIProtocol::bct(x, y, tile.getResources()));
    });
    _resourceManager->initialize();
    std::srand(static_cast<unsigned>(std::time(nullptr)));

    _server.setOnConnect([this](Client &client) { onConnect(client); });
    _server.setOnDisconnect([this](Client &client) { onDisconnect(client); });
    _server.setOnData([this](Client &client) { onData(client); });
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
    broadcastToAll(AIProtocol::formatMessage("Server started"));

    while (_running) {
        double wait = getTimeUntilNextEvent();
        int timeoutMs = (wait < 0) ? 100 : static_cast<int>(wait * 1000);
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
        if (_resourceTimer >= spawnInterval) {
            _resourceTimer -= spawnInterval;
            _resourceManager->spawn();
        }
    }

    double foodInterval = Constants::FOOD_UNITS / static_cast<double>(_freq);
    _foodTimer += deltaTime;
    if (_foodTimer >= foodInterval) {
        _foodTimer -= foodInterval;
        for (auto &p : _players) {
            if (p->isDead() || p->isIncanting())
                continue;
            p->consumeFood();
            if (p->isDead()) {
                auto *client = getClientByPlayer(*p);
                if (client) {
                    client->pushLine("dead\n");
                    broadcastToGUI(GUIProtocol::pdi(p->getId()));
                }
            }
        }
    }
}

double ServerApp::getTimeUntilNextEvent() const
{
    double nextAction = _scheduler ? _scheduler->getTimeUntilNextAction() : -1;
    double spawnInterval = Constants::SPAWN_INTERVAL / static_cast<double>(_freq);
    double remainingSpawn = spawnInterval - _resourceTimer;
    double foodInterval = Constants::FOOD_UNITS / static_cast<double>(_freq);
    double remainingFood = foodInterval - _foodTimer;

    double minTime = std::min(remainingSpawn, remainingFood);
    if (nextAction >= 0)
        minTime = std::min(minTime, nextAction);
    return std::max(0.0, minTime);
}

void ServerApp::onConnect(Client &client)
{
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
    auto sit = std::find_if(_sessions.begin(), _sessions.end(),
        [&client](const auto &p) { return &p.second->getClient() == &client; });
    if (sit != _sessions.end()) {
        int playerId = client.getPlayerId();
        if (playerId >= 0) {
            for (auto &team : _teams) {
                for (auto *player : team.getPlayers()) {
                    if (player->getId() == playerId) {
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
        egg->hatch();
        broadcastToGUI(GUIProtocol::ebo(egg->getId()));
    } else {
        spawnPos = {std::rand() % _map->getWidth(), std::rand() % _map->getHeight()};
    }

    int dir = (std::rand() % 4) + 1;
    player->setOrientation(static_cast<Orientation>(dir));
    player->setPosition(spawnPos);
    _map->getTile(spawnPos).addPlayer(player);
    player->getInventory()[ResourceType::FOOD] = 10;

    session.getClient().pushLine(AIProtocol::formatClientNum(team->getFreeSlots()));
    session.getClient().pushLine(AIProtocol::formatMapSize(_map->getWidth(), _map->getHeight()));

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
        if (!egg.isHatched() && !egg.isDead())
            client.pushLine(GUIProtocol::enw(egg.getId(), 0, egg.getPosition().x, egg.getPosition().y));
    }
}

void ServerApp::handleAICommand(Session &session, const std::string &line)
{
    Player *player = session.getPlayer();
    if (!player)
        return;

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

        session.getClient().pushLine(AIProtocol::formatElevationUnderway());

        std::vector<int> ids;
        for (auto *p : participants) ids.push_back(p->getId());
        broadcastToGUI(GUIProtocol::pic(tile->getPosition().x, tile->getPosition().y,
                                         player->getLevel(), ids));

        _scheduler->schedule(player, ActionType::INCANTATION, {});
        return;
    }

    _scheduler->schedule(player, action.type, action.args);
}

void ServerApp::handleGUICommand(Session &session, const std::string &line)
{
    Client &client = session.getClient();
    std::vector<std::string> args;
    auto req = GUIProtocol::parse(line, args);

    switch (req) {
        case GUIProtocol::Request::MSZ:
            client.pushLine(GUIProtocol::msz(_map->getWidth(), _map->getHeight()));
            break;
        case GUIProtocol::Request::BCT: {
            if (args.size() < 2) { client.pushLine("sbp\n"); break; }
            int x = std::stoi(args[0]);
            int y = std::stoi(args[1]);
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
            Player *p = findPlayer(id);
            if (p) client.pushLine(GUIProtocol::ppo(id, p->getPosition().x, p->getPosition().y,
                static_cast<int>(p->getOrientation())));
            break;
        }
        case GUIProtocol::Request::PLV: {
            if (args.size() < 1) { client.pushLine("sbp\n"); break; }
            int id = std::stoi(args[0]);
            Player *p = findPlayer(id);
            if (p) client.pushLine(GUIProtocol::plv(id, p->getLevel()));
            break;
        }
        case GUIProtocol::Request::PIN: {
            if (args.size() < 1) { client.pushLine("sbp\n"); break; }
            int id = std::stoi(args[0]);
            Player *p = findPlayer(id);
            if (p) client.pushLine(GUIProtocol::pin(id, p->getPosition().x, p->getPosition().y,
                p->getInventory()));
            break;
        }
        case GUIProtocol::Request::SGT:
            client.pushLine(GUIProtocol::sgt(_freq));
            break;
        case GUIProtocol::Request::SST: {
            if (args.size() < 1) { client.pushLine("sbp\n"); break; }
            _freq = std::stoi(args[0]);
            client.pushLine(GUIProtocol::sst(_freq));
            break;
        }
        default:
            client.pushLine("suc\n");
            break;
    }
}

void ServerApp::onData(Client &client)
{
    auto it = _sessions.find(client.getFd());
    if (it == _sessions.end())
        return;

    while (client.hasLine()) {
        std::string line = client.popLine();
        it->second->handleLine(line);
    }
}

void ServerApp::onActionReady(Player *player, ActionType type,
                               const std::vector<std::string> &args)
{
    if (!player)
        return;

    switch (type) {
        case ActionType::FORWARD: handleForward(*player); break;
        case ActionType::RIGHT: handleRight(*player); break;
        case ActionType::LEFT: handleLeft(*player); break;
        case ActionType::LOOK: handleLook(*player); break;
        case ActionType::INVENTORY: handleInventory(*player); break;
        case ActionType::BROADCAST:
            handleBroadcast(*player, args.empty() ? "" : args[0]);
            break;
        case ActionType::CONNECT_NBR: handleConnectNbr(*player); break;
        case ActionType::FORK: handleFork(*player); break;
        case ActionType::EJECT: handleEject(*player); break;
        case ActionType::TAKE:
            handleTake(*player, args.empty() ? "" : args[0]);
            break;
        case ActionType::SET:
            handleSet(*player, args.empty() ? "" : args[0]);
            break;
        case ActionType::INCANTATION: handleIncantation(*player); break;
        default: break;
    }
}

void ServerApp::handleForward(Player &player)
{
    Position pos = player.getPosition();
    switch (player.getOrientation()) {
        case Orientation::NORTH: pos.y = (pos.y - 1 + _map->getHeight()) % _map->getHeight(); break;
        case Orientation::EAST: pos.x = (pos.x + 1) % _map->getWidth(); break;
        case Orientation::SOUTH: pos.y = (pos.y + 1) % _map->getHeight(); break;
        case Orientation::WEST: pos.x = (pos.x - 1 + _map->getWidth()) % _map->getWidth(); break;
    }

    auto *oldTile = player.getTile();
    if (oldTile)
        oldTile->removePlayer(&player);
    _map->getTile(pos).addPlayer(&player);
    player.setPosition(pos);

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());

    broadcastToGUI(GUIProtocol::ppo(player.getId(), pos.x, pos.y,
                                     static_cast<int>(player.getOrientation())));
}

void ServerApp::handleRight(Player &player)
{
    int orient = static_cast<int>(player.getOrientation());
    orient = (orient % 4) + 1;
    player.setOrientation(static_cast<Orientation>(orient));

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());

    broadcastToGUI(GUIProtocol::ppo(player.getId(), player.getPosition().x,
                                     player.getPosition().y, orient));
}

void ServerApp::handleLeft(Player &player)
{
    int orient = static_cast<int>(player.getOrientation());
    orient = (orient == 1) ? 4 : orient - 1;
    player.setOrientation(static_cast<Orientation>(orient));

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());

    broadcastToGUI(GUIProtocol::ppo(player.getId(), player.getPosition().x,
                                     player.getPosition().y, orient));
}

void ServerApp::handleLook(Player &player)
{
    std::string result = LookSystem::look(player, *_map);
    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(result);
}

void ServerApp::handleInventory(Player &player)
{
    auto &inv = player.getInventory();
    std::string result = "[food " + std::to_string(inv[ResourceType::FOOD]);

    const char *names[] = {"linemate", "deraumere", "sibur", "mendiane", "phiras", "thystame"};
    for (int i = 0; i < 6; i++) {
        auto type = static_cast<ResourceType>(i + 1);
        result += ", " + std::string(names[i]) + " " + std::to_string(inv[type]);
    }
    result += "]\n";

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(result);
}

void ServerApp::handleBroadcast(Player &player, const std::string &msg)
{
    std::vector<Player *> allPlayers;
    for (auto &team : _teams) {
        for (auto *p : team.getPlayers())
            allPlayers.push_back(p);
    }

    for (auto *p : allPlayers) {
        if (p == &player)
            continue;
        auto *otherClient = getClientByPlayer(*p);
        if (!otherClient)
            continue;
        int dir = BroadcastSystem::computeDirection(player.getPosition(),
                     p->getPosition(), p->getOrientation(), *_map);
        otherClient->pushLine(AIProtocol::formatBroadcast(dir, msg));
    }

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());
}

void ServerApp::handleConnectNbr(Player &player)
{
    auto *team = getTeamByPlayer(player);
    if (!team)
        return;
    int free = team->getFreeSlots();
    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatClientNum(free));
}

void ServerApp::handleFork(Player &player)
{
    Position pos = player.getPosition();
    int eggId = _nextEggId++;

    Egg egg(eggId, player.getTeamName(), pos);
    _eggs.push_back(egg);

    auto *team = getTeamByPlayer(player);
    if (team)
        team->addEgg(&_eggs.back());

    _map->getTile(pos).addEgg(&_eggs.back());

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());

    broadcastToGUI(GUIProtocol::pfk(player.getId()));
    broadcastToGUI(GUIProtocol::enw(eggId, player.getId(), pos.x, pos.y));
}

void ServerApp::handleEject(Player &player)
{
    auto *tile = player.getTile();
    if (!tile)
        return;

    auto players = tile->getPlayers();
    bool ejected = false;

    for (auto *p : players) {
        if (p == &player)
            continue;

        Position newPos = p->getPosition();
        switch (player.getOrientation()) {
            case Orientation::NORTH: newPos.y = (newPos.y - 1 + _map->getHeight()) % _map->getHeight(); break;
            case Orientation::EAST: newPos.x = (newPos.x + 1) % _map->getWidth(); break;
            case Orientation::SOUTH: newPos.y = (newPos.y + 1) % _map->getHeight(); break;
            case Orientation::WEST: newPos.x = (newPos.x - 1 + _map->getWidth()) % _map->getWidth(); break;
        }

        tile->removePlayer(p);
        _map->getTile(newPos).addPlayer(p);
        p->setPosition(newPos);

        int dir = 1;
        auto *otherClient = getClientByPlayer(*p);
        if (otherClient)
            otherClient->pushLine(AIProtocol::formatEject(dir));

        broadcastToGUI(GUIProtocol::pex(p->getId()));
        broadcastToGUI(GUIProtocol::ppo(p->getId(), newPos.x, newPos.y,
                                         static_cast<int>(p->getOrientation())));
        ejected = true;
    }

    auto eggs = tile->getEggs();
    for (auto *egg : eggs) {
        egg->kill();
        broadcastToGUI(GUIProtocol::edi(egg->getId()));
        ejected = true;
    }

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(ejected ? AIProtocol::formatOk() : AIProtocol::formatKo());
}

void ServerApp::handleTake(Player &player, const std::string &obj)
{
    ResourceType type;
    if (obj == "food") type = ResourceType::FOOD;
    else if (obj == "linemate") type = ResourceType::LINEMATE;
    else if (obj == "deraumere") type = ResourceType::DERAUMERE;
    else if (obj == "sibur") type = ResourceType::SIBUR;
    else if (obj == "mendiane") type = ResourceType::MENDIANE;
    else if (obj == "phiras") type = ResourceType::PHIRAS;
    else if (obj == "thystame") type = ResourceType::THYSTAME;
    else {
        auto *client = getClientByPlayer(player);
        if (client) client->pushLine(AIProtocol::formatKo());
        return;
    }

    auto *tile = player.getTile();
    if (!tile || tile->getResources()[type] <= 0) {
        auto *client = getClientByPlayer(player);
        if (client) client->pushLine(AIProtocol::formatKo());
        return;
    }

    tile->getResources()[type]--;
    player.getInventory()[type]++;

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());

    broadcastToGUI(GUIProtocol::pgt(player.getId(), static_cast<int>(type)));
    broadcastToGUI(GUIProtocol::pin(player.getId(), player.getPosition().x,
                                     player.getPosition().y, player.getInventory()));
}

void ServerApp::handleSet(Player &player, const std::string &obj)
{
    ResourceType type;
    if (obj == "food") type = ResourceType::FOOD;
    else if (obj == "linemate") type = ResourceType::LINEMATE;
    else if (obj == "deraumere") type = ResourceType::DERAUMERE;
    else if (obj == "sibur") type = ResourceType::SIBUR;
    else if (obj == "mendiane") type = ResourceType::MENDIANE;
    else if (obj == "phiras") type = ResourceType::PHIRAS;
    else if (obj == "thystame") type = ResourceType::THYSTAME;
    else {
        auto *client = getClientByPlayer(player);
        if (client) client->pushLine(AIProtocol::formatKo());
        return;
    }

    if (player.getInventory()[type] <= 0) {
        auto *client = getClientByPlayer(player);
        if (client) client->pushLine(AIProtocol::formatKo());
        return;
    }

    player.getInventory()[type]--;
    auto *tile = player.getTile();
    if (tile)
        tile->getResources()[type]++;

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());

    broadcastToGUI(GUIProtocol::pdr(player.getId(), static_cast<int>(type)));
    broadcastToGUI(GUIProtocol::pin(player.getId(), player.getPosition().x,
                                     player.getPosition().y, player.getInventory()));
}

void ServerApp::handleIncantation(Player &player)
{
    auto *tile = player.getTile();
    int targetLevel = player.getLevel() + 1;

    bool success = tile && targetLevel <= 8 &&
                   IncantationSystem::performIncantation(*tile, targetLevel);

    broadcastToGUI(GUIProtocol::pie(tile ? tile->getPosition().x : 0,
                                     tile ? tile->getPosition().y : 0, success ? 1 : 0));

    if (success) {
        for (auto *p : tile->getPlayers()) {
            if (p->getLevel() == targetLevel - 1 && p->isIncanting()) {
                p->setLevel(targetLevel);
                p->setIncanting(false);
                auto *pClient = getClientByPlayer(*p);
                if (pClient)
                    pClient->pushLine(AIProtocol::formatCurrentLevel(targetLevel));
                broadcastToGUI(GUIProtocol::plv(p->getId(), targetLevel));
            }
        }
        checkWinCondition();
    } else {
        for (auto &p : _players) {
            if (p->isIncanting()) {
                p->setIncanting(false);
                auto *pClient = getClientByPlayer(*p);
                if (pClient)
                    pClient->pushLine(AIProtocol::formatKo());
            }
        }
    }
}

Session *ServerApp::getSessionByPlayer(Player &player)
{
    for (auto &[fd, session] : _sessions) {
        if (session->getPlayer() && session->getPlayer()->getId() == player.getId())
            return session;
    }
    return nullptr;
}

Client *ServerApp::getClientByPlayer(Player &player)
{
    auto *session = getSessionByPlayer(player);
    return session ? &session->getClient() : nullptr;
}

Team *ServerApp::getTeam(const std::string &name)
{
    for (auto &team : _teams) {
        if (team.getName() == name)
            return &team;
    }
    return nullptr;
}

Team *ServerApp::getTeamByPlayer(Player &player)
{
    return getTeam(player.getTeamName());
}

Player *ServerApp::findPlayer(int id)
{
    for (auto &p : _players) {
        if (p && p->getId() == id)
            return p.get();
    }
    return nullptr;
}

void ServerApp::checkWinCondition()
{
    for (auto &team : _teams) {
        if (team.hasWon()) {
            _gameOver = true;
            _winner = team.getName();
            broadcastToGUI(GUIProtocol::seg(_winner));
            broadcastToAll(AIProtocol::formatMessage("Team " + _winner + " wins!"));
            break;
        }
    }
}

void ServerApp::broadcastToGUI(const std::string &msg)
{
    for (auto &[fd, session] : _sessions) {
        if (session->isGUI())
            session->getClient().pushLine(msg);
    }
}

void ServerApp::broadcastToAll(const std::string &msg)
{
    for (auto &[fd, session] : _sessions) {
        (void)fd;
        session->getClient().pushLine(msg);
    }
}
