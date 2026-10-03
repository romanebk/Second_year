# `src/game/ActionHandler.cpp` — Implémentation du gestionnaire d'actions

444 lignes, le fichier le plus gros de la partie Ariel.

---

```cpp
#include "../../include/game/ActionHandler.hpp"
#include "../../include/game/CommandUtils.hpp"
#include "../../include/game/LookSystem.hpp"
#include "../../include/game/BroadcastSystem.hpp"
#include "../../include/game/IncantationSystem.hpp"
#include "../../include/protocol/AIProtocol.hpp"
#include "../../include/protocol/GUIProtocol.hpp"
#include "../../include/common/Constants.hpp"
#include <algorithm>
```
**Lignes 1-9** — Inclusions : tous les sous-systèmes de jeu + protocoles AI et GUI.

```cpp
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
```
**Lignes 11-25** — Constructeur : stocke toutes les références. `ActionHandler` ne possède rien, il manipule les données via références.

---

### `execute()` — Dispatching (l. 27-51)

```cpp
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
        default: break;
    }
}
```
**Lignes 27-51** — Switch sur le type d'action. Les actions avec argument (Broadcast, Take, Set) extraient `args[0]` ou une chaîne vide.

---

### `handleForward()` — Avancer (l. 53-75)

```cpp
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
```
**Lignes 53-75** — `Forward` :
1. Calcule la nouvelle position selon l'orientation (wrapping torique).
2. Retire le joueur de l'ancienne tuile, l'ajoute à la nouvelle.
3. Met à jour la position du joueur.
4. Envoie `ok` au client AI.
5. Notifie le GUI avec `ppo`.

---

### `handleRight()` / `handleLeft()` — Tourner (l. 77-103)

```cpp
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
```
**Lignes 77-89** — `Right` : incrémente l'orientation (1→2→3→4→1).

```cpp
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
```
**Lignes 91-103** — `Left` : décrémente l'orientation (1→4→3→2→1).

---

### `handleLook()` — Regarder (l. 105-111)

```cpp
void ActionHandler::handleLook(Player &player)
{
    std::string result = LookSystem::look(player, _map);
    auto *client = getClientByPlayer(player);
    if (client)
        client->pushLine(result);
}
```
**Lignes 105-111** — Appelle `LookSystem::look()` qui calcule le cône de vision et formate le résultat. Envoie directement la chaîne au client.

---

### `handleInventory()` — Inventaire (l. 113-128)

```cpp
void ActionHandler::handleInventory(Player &player)
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
```
**Lignes 113-128** — Formate l'inventaire : `[food N, linemate N, deraumere N, ...]\n`.

---

### `handleBroadcast()` — Diffusion (l. 130-154)

```cpp
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
```
**Lignes 130-154** — Broadcast :
1. Collectionne tous les joueurs de toutes les équipes.
2. Pour chaque autre joueur : calcule la direction via `BroadcastSystem::computeDirection()`, envoie `message K, msg`.
3. Notifie le GUI avec `pbc`.
4. Envoie `ok` à l'émetteur.

---

### `handleConnectNbr()` — Nombre de connexions (l. 156-165)

```cpp
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
```
**Lignes 156-165** — Retourne le nombre de slots libres dans l'équipe du joueur.

---

### `handleFork()` — Pondre un œuf (l. 167-191)

```cpp
void ActionHandler::handleFork(Player &player)
{
    Position pos = player.getPosition();
    int eggId = _nextEggId++;

    auto egg = std::make_unique<Egg>(eggId, player.getTeamName(), pos);
    Egg *eggPtr = egg.get();
    _eggs.push_back(std::move(egg));

    auto *team = getTeamByPlayer(player);
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
```
**Lignes 167-191** — Fork :
1. Crée un `Egg` avec un ID unique.
2. Ajoute l'œuf à la liste globale `_eggs`, à l'équipe, et à la tuile.
3. Calcule le temps d'éclosion (`EGG_HATCH_TIME / freq`) et l'ajoute aux `_pendingEggs`.
4. Notifie le GUI avec `pfk` et `enw`.

---

### `handleEject()` — Expulser (l. 193-253)

```cpp
void ActionHandler::handleEject(Player &player)
{
    auto *tile = player.getTile();
    if (!tile) return;

    auto players = tile->getPlayers();
    bool ejected = false;

    for (auto *p : players) {
        if (p == &player) continue;

        if (p->isIncanting()) {
            p->setIncanting(false);
            _scheduler.clearPlayerActions(p);
            _incantationParticipants.erase(p);
            for (auto &[initiator, parts] : _incantationParticipants) {
                (void)initiator;
                parts.erase(std::remove(parts.begin(), parts.end(), p), parts.end());
            }
        }

        Position newPos = p->getPosition();
        switch (player.getOrientation()) {
            case Orientation::NORTH: newPos.y = (newPos.y - 1 + _map.getHeight()) % _map.getHeight(); break;
            case Orientation::EAST: newPos.x = (newPos.x + 1) % _map.getWidth(); break;
            case Orientation::SOUTH: newPos.y = (newPos.y + 1) % _map.getHeight(); break;
            case Orientation::WEST: newPos.x = (newPos.x - 1 + _map.getWidth()) % _map.getWidth(); break;
        }

        tile->removePlayer(p);
        _map.getTile(newPos).addPlayer(p);
        p->setPosition(newPos);

        int dir = BroadcastSystem::computeDirection(player.getPosition(),
                     p->getPosition(), p->getOrientation(), _map);
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
```
**Lignes 193-253** — Eject :
1. Pour chaque autre joueur sur la même tuile :
   - Si le joueur incantait, annule l'incantation (`clearPlayerActions`, suppression des participants).
   - Pousse le joueur d'une case dans la direction de l'éjecteur.
   - Envoie `eject: dir` au joueur expulsé.
   - Notifie le GUI avec `pex` et `ppo`.
2. Écrase tous les œufs sur la tuile (les tue et les retire de l'équipe).
3. Si au moins un joueur ou œuf a été ejecté, envoie `ok`, sinon `ko`.

---

### `handleTake()` / `handleSet()` — Prendre / Poser (l. 255-315)

```cpp
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
    if (client) client->pushLine(AIProtocol::formatOk());

    broadcastToGUI(GUIProtocol::pgt(player.getId(), static_cast<int>(type)));
    broadcastToGUI(GUIProtocol::pin(player.getId(), player.getPosition().x,
                                     player.getPosition().y, player.getInventory()));
    broadcastToGUI(GUIProtocol::bct(player.getPosition().x, player.getPosition().y,
                                     tile->getResources()));
```
**Lignes 262-290** — `Take` : parse le nom de ressource (`parseResourceType`), vérifie que la tuile en a, transfère de la tuile vers l'inventaire du joueur. Notifie le GUI avec `pgt` (prise ressource), `pin` (inventaire joueur mis à jour), `bct` (contenu tuile mis à jour).

```cpp
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
```
**Lignes 292-322** — `Set` : inverse de Take. Transfère de l'inventaire du joueur vers la tuile. Notifie le GUI avec `pdr` (drop ressource), `pin`, `bct`.

---

### `handleIncantation()` — Incantation (l. 317-358)

```cpp
void ActionHandler::handleIncantation(Player &player)
{
    auto *tile = player.getTile();
    int targetLevel = player.getLevel() + 1;

    auto it = _incantationParticipants.find(&player);
    std::vector<Player *> participants = (it != _incantationParticipants.end())
        ? it->second : std::vector<Player *>();

    bool success = tile && targetLevel <= 8 &&
                   IncantationSystem::performIncantation(*tile, targetLevel, participants);

    broadcastToGUI(GUIProtocol::pie(tile ? tile->getPosition().x : 0,
                                     tile ? tile->getPosition().y : 0, success ? 1 : 0));

    if (it != _incantationParticipants.end())
        _incantationParticipants.erase(it);

    if (success) {
        if (tile)
            broadcastToGUI(GUIProtocol::bct(tile->getPosition().x, tile->getPosition().y,
                                             tile->getResources()));
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
```
**Lignes 317-358** — Incantation (appelé après le timer de 300 ticks) :
1. Récupère les participants stockés lors du début de l'incantation.
2. Exécute `performIncantation()` (vérifie conditions + consomme ressources).
3. Si succès : monte le niveau des participants, désactive `_incanting`, envoie `Current level: N`, notifie GUI, vérifie victoire.
4. Si échec : envoie `ko` à tous les participants (maintenus en incantation).

---

### `getSessionByPlayer()` / `getClientByPlayer()` (l. 360-374)

```cpp
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
```
**Lignes 360-374** — Parcourt la map des sessions pour trouver celle associée à un joueur. `getClientByPlayer()` retourne le `Client` de cette session.

---

### `getTeam()` / `getTeamByPlayer()` / `findPlayer()` (l. 376-397)

```cpp
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
```
**Lignes 376-397** — Utilitaires de recherche : trouve une équipe par nom, l'équipe d'un joueur, ou un joueur par ID.

---

### `checkWinCondition()` (l. 399-410)

```cpp
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
```
**Lignes 399-410** — Vérifie si une équipe a gagné (6 joueurs niveau 8). Si oui : set `_gameOver`, stocke le nom du gagnant, notifie GUI et tous les joueurs.

---

### `checkEggHatches()` (l. 412-427)

```cpp
void ActionHandler::checkEggHatches(double deltaTime)
{
    for (auto it = _pendingEggs.begin(); it != _pendingEggs.end();) {
        it->remainingTime -= deltaTime;
        if (it->remainingTime <= 0) {
            Egg *egg = it->egg;
            if (!egg->isHatched()) {
                egg->hatch();
                broadcastToGUI(GUIProtocol::ebo(egg->getId()));
            }
            it = _pendingEggs.erase(it);
        } else {
            ++it;
        }
    }
}
```
**Lignes 412-427** — Appelé à chaque tick. Décrémente le timer de chaque œuf. Quand le timer atteint 0, marque l'œuf comme éclos et notifie le GUI avec `ebo`.

---

### `broadcastToGUI()` / `broadcastToAll()` (l. 429-444)

```cpp
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
        session->getClient().pushLine(msg);
    }
}
```
**Lignes 429-444** — `broadcastToGUI()` envoie un message uniquement aux sessions GUI. `broadcastToAll()` envoie à toutes les sessions (y compris AI).
