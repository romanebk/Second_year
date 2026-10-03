/*
** EPITECH PROJECT, 2026
** ActionHandler.cpp
** File description:
** Handle all player actions
*/#include "../../include/game/ActionHandler.hpp"
#include "../../include/game/CommandUtils.hpp"
#include "../../include/game/LookSystem.hpp"
#include "../../include/game/BroadcastSystem.hpp"
#include "../../include/game/IncantationSystem.hpp"
#include "../../include/protocol/AIProtocol.hpp"
#include "../../include/protocol/GUIProtocol.hpp"
#include "../../include/common/Constants.hpp"
#include <algorithm>

ActionHandler::ActionHandler(IMap &map, std::vector<Team> &teams,
                             std::vector<std::unique_ptr<Player>> &players,
                             std::vector<std::unique_ptr<Egg>> &eggs,
                             std::map<int, Session *> &sessions,
                             CommandScheduler &scheduler,
                             std::map<Player *, std::vector<Player *>> &incantationParticipants,
                             std::vector<PendingEgg> &pendingEggs,
                             int &nextEggId, int freq,
                             bool &gameOver, std::string &winner)
    : _map(map), _teams(teams), _players(players), _eggs(eggs),
      _sessions(sessions), _scheduler(scheduler),
      _incantationParticipants(incantationParticipants),
      _pendingEggs(pendingEggs),
      _nextEggId(nextEggId), _freq(freq),
      _gameOver(gameOver), _winner(winner) {}

void ActionHandler::execute(Player &player, ActionType type,
                             const std::vector<std::string> &args)
{
    switch (type) {
        case ActionType::FORWARD: handleForward(player); break;
        case ActionType::RIGHT: handleRight(player); break;
        case ActionType::LEFT: handleLeft(player); break;
        case ActionType::LOOK: handleLook(player); break;
        case ActionType::INVENTORY: handleInventory(player); break;
        case ActionType::BROADCAST:
            handleBroadcast(player, args.empty() ? "" : args[0]);
            break;
        case ActionType::CONNECT_NBR: handleConnectNbr(player); break;
        case ActionType::FORK: handleFork(player); break;
        case ActionType::EJECT: handleEject(player); break;
        case ActionType::TAKE:
            handleTake(player, args.empty() ? "" : args[0]);
            break;
        case ActionType::SET:
            handleSet(player, args.empty() ? "" : args[0]);
            break;
        case ActionType::INCANTATION: handleIncantation(player); break;
        default: {
            auto *client = getClientByPlayer(player);
            if (client)
                client->pushLine(AIProtocol::formatKo());
            break;
        }
    }
}

void ActionHandler::handleForward(Player &player)
{
    Position pos = player.getPosition();
    switch (player.getOrientation()) {
        case Orientation::NORTH: pos.y = (pos.y - 1 + _map.getHeight()) % _map.getHeight(); break;
        case Orientation::EAST: pos.x = (pos.x + 1) % _map.getWidth(); break;
        case Orientation::SOUTH: pos.y = (pos.y + 1) % _map.getHeight(); break;
        case Orientation::WEST: pos.x = (pos.x - 1 + _map.getWidth()) % _map.getWidth(); break;
    }

    auto *oldTile = player.getTile();
    if (oldTile)
        oldTile->removePlayer(&player);
    _map.getTile(pos).addPlayer(&player);
    player.setPosition(pos);

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());

    broadcastToGUI(GUIProtocol::ppo(player.getId(), pos.x, pos.y,
                                     static_cast<int>(player.getOrientation())));
}

void ActionHandler::handleRight(Player &player)
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

void ActionHandler::handleLeft(Player &player)
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

void ActionHandler::handleLook(Player &player)
{
    std::string result = LookSystem::look(player, _map);
    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(result);
}

void ActionHandler::handleInventory(Player &player)
{
    auto &inv = player.getInventory();
    std::string result = "[";

    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++) {
        auto type = static_cast<ResourceType>(i);
        if (i > 0) result += ", ";
        result += std::string(resourceName(type)) + " " + std::to_string(inv[type]);
    }
    result += "]\n";

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(result);
}

void ActionHandler::handleBroadcast(Player &player, const std::string &msg)
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
                     p->getPosition(), p->getOrientation(), _map);
        otherClient->pushLine(AIProtocol::formatBroadcast(dir, msg));
    }

    broadcastToGUI(GUIProtocol::pbc(player.getId(), msg));

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());
}

void ActionHandler::handleConnectNbr(Player &player)
{
    auto *team = getTeamByPlayer(player);
    if (!team)
        return;
    int free = team->getFreeSlots();
    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatClientNum(free));
}

void ActionHandler::handleFork(Player &player)
{
    auto *team = getTeamByPlayer(player);
    if (!team) {
        auto *client = getClientByPlayer(player);
        if (client) client->pushLine(AIProtocol::formatKo());
        return;
    }

    Position pos = player.getPosition();
    int eggId = _nextEggId++;

    auto egg = std::make_unique<Egg>(eggId, player.getTeamName(), pos);
    Egg *eggPtr = egg.get();
    _eggs.push_back(std::move(egg));

    if (team)
        team->addEgg(eggPtr);

    _map.getTile(pos).addEgg(eggPtr);

    double hatchTime = Constants::EGG_HATCH_TIME / static_cast<double>(_freq);
    _pendingEggs.push_back({eggPtr, hatchTime});

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(AIProtocol::formatOk());

    broadcastToGUI(GUIProtocol::pfk(player.getId()));
    broadcastToGUI(GUIProtocol::enw(eggId, player.getId(), pos.x, pos.y));
}

void ActionHandler::handleEject(Player &player)
{
    auto *tile = player.getTile();
    if (!tile)
        return;

    auto players = tile->getPlayers();
    bool ejected = false;

    for (auto *p : players) {
        if (p == &player)
            continue;

        if (p->isIncanting()) {
            p->setIncanting(false);
            _scheduler.clearPlayerActions(p);
            auto initIt = _incantationParticipants.find(p);
            if (initIt != _incantationParticipants.end()) {
                for (auto *part : initIt->second) {
                    if (part && part != p && part->isIncanting()) {
                        part->setIncanting(false);
                        _scheduler.clearPlayerActions(part);
                        auto *pClient = getClientByPlayer(*part);
                        if (pClient)
                            pClient->pushLine(AIProtocol::formatKo());
                    }
                }
                _incantationParticipants.erase(initIt);
            }
            for (auto &[initiator, parts] : _incantationParticipants) {
                (void)initiator;
                parts.erase(std::remove(parts.begin(), parts.end(), p), parts.end());
            }
        }

        Position newPos = p->getPosition();
        Position oldPos = newPos;
        switch (player.getOrientation()) {
            case Orientation::NORTH: newPos.y = (newPos.y - 1 + _map.getHeight()) % _map.getHeight(); break;
            case Orientation::EAST: newPos.x = (newPos.x + 1) % _map.getWidth(); break;
            case Orientation::SOUTH: newPos.y = (newPos.y + 1) % _map.getHeight(); break;
            case Orientation::WEST: newPos.x = (newPos.x - 1 + _map.getWidth()) % _map.getWidth(); break;
        }

        tile->removePlayer(p);
        _map.getTile(newPos).addPlayer(p);
        p->setPosition(newPos);

        int dir = BroadcastSystem::computeDirection(newPos,
                     oldPos, p->getOrientation(), _map);
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
        tile->removeEgg(egg);
        for (auto &team : _teams)
            team.removeEgg(egg);
        broadcastToGUI(GUIProtocol::edi(egg->getId()));
        ejected = true;
    }

    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(ejected ? AIProtocol::formatOk() : AIProtocol::formatKo());
}

void ActionHandler::handleTake(Player &player, const std::string &obj)
{
    ResourceType type = parseResourceType(obj);
    if (type == ResourceType::COUNT) {
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
    broadcastToGUI(GUIProtocol::bct(player.getPosition().x, player.getPosition().y,
                                     tile->getResources()));
}

void ActionHandler::handleSet(Player &player, const std::string &obj)
{
    ResourceType type = parseResourceType(obj);
    if (type == ResourceType::COUNT) {
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
    if (tile)
        broadcastToGUI(GUIProtocol::bct(player.getPosition().x, player.getPosition().y,
                                         tile->getResources()));
}

void ActionHandler::handleIncantation(Player &player)
{
    auto *tile = player.getTile();
    int targetLevel = player.getLevel() + 1;

    auto it = _incantationParticipants.find(&player);
    std::vector<Player *> participants = (it != _incantationParticipants.end())
        ? it->second : std::vector<Player *>();

    bool success = tile && targetLevel <= 8 &&
                   IncantationSystem::performIncantation(*tile, targetLevel, participants);

    auto pos = tile ? tile->getPosition() : player.getPosition();
    broadcastToGUI(GUIProtocol::pie(pos.x, pos.y, success ? 1 : 0));

    if (it != _incantationParticipants.end())
        _incantationParticipants.erase(it);

    if (success) {
        broadcastToGUI(GUIProtocol::bct(pos.x, pos.y, tile->getResources()));
        for (auto *p : participants) {
            if (p->getLevel() == targetLevel - 1) {
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
        for (auto *p : participants) {
            p->setIncanting(false);
            auto *pClient = getClientByPlayer(*p);
            if (pClient)
                pClient->pushLine(AIProtocol::formatKo());
        }
    }
}

Session *ActionHandler::getSessionByPlayer(Player &player)
{
    for (auto &[fd, session] : _sessions) {
        (void)fd;
        if (session->getPlayer() && session->getPlayer()->getId() == player.getId())
            return session;
    }
    return nullptr;
}

Client *ActionHandler::getClientByPlayer(Player &player)
{
    auto *session = getSessionByPlayer(player);
    return session ? &session->getClient() : nullptr;
}

Team *ActionHandler::getTeam(const std::string &name)
{
    for (auto &team : _teams) {
        if (team.getName() == name)
            return &team;
    }
    return nullptr;
}

Team *ActionHandler::getTeamByPlayer(Player &player)
{
    return getTeam(player.getTeamName());
}

Player *ActionHandler::findPlayer(int id)
{
    for (auto &p : _players) {
        if (p && p->getId() == id)
            return p.get();
    }
    return nullptr;
}

void ActionHandler::checkWinCondition()
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

void ActionHandler::checkEggHatches(double deltaTime)
{
    for (auto it = _pendingEggs.begin(); it != _pendingEggs.end();) {
        it->remainingTime -= deltaTime;
        if (it->remainingTime <= 0) {
            Egg *egg = it->egg;
            if (!egg->isDead() && !egg->isHatched()) {
                egg->hatch();
                broadcastToGUI(GUIProtocol::ebo(egg->getId()));
            }
            it = _pendingEggs.erase(it);
        } else {
            ++it;
        }
    }

    _eggs.erase(
        std::remove_if(_eggs.begin(), _eggs.end(),
            [](const auto &egg) { return egg->isDead(); }),
        _eggs.end());
}

void ActionHandler::cancelIncantation(Player &player)
{
    auto it = _incantationParticipants.find(&player);
    if (it == _incantationParticipants.end())
        return;

    for (auto *p : it->second) {
        if (p && p->isIncanting()) {
            p->setIncanting(false);
            _scheduler.clearPlayerActions(p);
            auto *pClient = getClientByPlayer(*p);
            if (pClient)
                pClient->pushLine(AIProtocol::formatKo());
        }
    }
    it->second.clear();
}

void ActionHandler::broadcastToGUI(const std::string &msg)
{
    for (auto &[fd, session] : _sessions) {
        (void)fd;
        if (session->isGUI())
            session->getClient().pushLine(msg);
    }
}

void ActionHandler::broadcastToAll(const std::string &msg)
{
    for (auto &[fd, session] : _sessions) {
        (void)fd;
        if (!session->isGUI())
            session->getClient().pushLine(msg);
    }
}
