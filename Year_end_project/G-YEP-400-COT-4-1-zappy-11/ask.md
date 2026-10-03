# Questions & Réponses — Architecture Zappy

---

## 1. Timeout du serveur : 10 ms ? Pourquoi des ms ?

**Ce n'est pas un timeout fixe de 10 ms.** Le timeout est **dynamique**, calculé à chaque itération de la boucle principale.

Dans `ServerApp::run()` (`src/ServerApp.cpp:74-82`) :

```cpp
double wait = getTimeUntilNextEvent();
int timeoutMs = (wait < 0) ? 1000 : static_cast<int>(wait * 1000);
if (timeoutMs < 1 && wait > 0)
    timeoutMs = 1;
_server.run(timeoutMs);  // → poll(fds, nfds, timeoutMs)
```

| Condition | Timeout |
|-----------|---------|
| Rien en attente (idle) | **1000 ms** |
| Événement imminent (< 1ms) | **1 ms** (minimum) |
| Sinon | `wait * 1000` ms (valeur dynamique) |

L'ADR-006 (`documentation/ADR.md:60`) dit que `freq=100 → 1 tick = 10 ms`. C'est le **temps d'un tick de jeu** (ex: Forward = 7 ticks = 70 ms à freq=100), **pas** le timeout de `poll()`.

**Pourquoi des ms plutôt que du busy waiting ?**

Le `poll(timeoutMs)` est un appel système **bloquant** :
- Le processus est mis en veille par le noyau → **0% CPU** en idle
- Il se réveille immédiatement si un client envoie des données (réactivité réseau)
- Il se réveille au timeout exact pour traiter les événements temporels (scheduler, nourriture, spawn)

Un busy waiting (`while(true) { poll(fds, 0); /* spin */ }`) consommerait **100% CPU** inutilement.

→ `poll()` sert **à la fois** de multiplexeur E/S et de timer précis.

---

## 2. Séparation logique de jeu : serveur vs player

L'architecture suit 4 couches avec des responsabilités bien séparées :

```
┌─────────────────────────────────────────────────────┐
│              ServerApp (orchestrateur)                │
│  Boucle principale, réseau, timers globaux            │
│  Aucune logique métier directe                        │
├─────────────────────────────────────────────────────┤
│              ActionHandler (logique de jeu)           │
│  execute() → switch(type) → handleForward/handleTake… │
│  Modifie Map/Player/Inventory                         │
│  Envoie les notifications GUI (ppo, pgt, bct…)        │
│  Vérifie condition de victoire                        │
├─────────────────────────────────────────────────────┤
│        CommandScheduler (temporisation)                │
│  Priority queue d'actions avec temps cumulatif         │
│  Limite : 10 actions max par joueur                    │
│  Callback _onActionReady → ActionHandler::execute()    │
├─────────────────────────────────────────────────────┤
│     Player / Team / Egg / Map / Tile (données)         │
│  Player.hpp:18 → simple état (id, level, pos, inv…)   │
│  Aucun comportement métier — classe anémique           │
└─────────────────────────────────────────────────────┘
```

- **`ServerApp`** ne contient **aucune** logique métier — il coordonne (réseau → parsing → scheduler → action → notification)
- **`Player`** est une **structure de données** pure (état uniquement)
- **`ActionHandler`** contient **toute la logique** (déplacement, inventaire, broadcast, incantation, etc.)
- **`CommandScheduler`** découple la **réception** (immédiate) de l'**exécution** (différée)

---

## 3. Fonctions réseau qui appellent le côté application

### Chemin complet d'une commande (ex: `Inventory\n`)

```
Socket (read)
  → Client::onReadable()              [Client.cpp:15]
    → Server::_onData(client)         [Server.cpp:228]
      → ServerApp::onData()           [ServerApp.cpp:420]
        → Session::handleLine(line)   [Session.cpp:17]
          → _onAICommand(session, line)  [Session.cpp:37]
            → ServerApp::handleAICommand()  [ServerApp.cpp:285]
              → AIProtocol::parse()   → ActionType::INVENTORY
              → _scheduler->schedule(player, INVENTORY, {})  [CommandScheduler.cpp:14]

--- [plus tard] ---

CommandScheduler::update(deltaTime)    [CommandScheduler.cpp:35]
  → _onActionReady(player, INVENTORY, {})  [CommandScheduler.cpp:46]
    → ServerApp::onActionReady()       [ServerApp.cpp:432]
      → _actions->execute(player, INVENTORY, {})  [ActionHandler.cpp:34]
        → handleInventory(player)      [ActionHandler.cpp:125]
          → player.getInventory()
          → format réponse
          → getClientByPlayer(player)  [ActionHandler.cpp:399]
            → client->pushLine(result) [Client.cpp:51]
```

### Callbacks réseau qui connectent les couches

| Callback | Enregistré dans | Déclenché par | Rôle |
|----------|-----------------|---------------|------|
| `Server::_onConnect` | `ServerApp::init()`:56 | `acceptNewClient()` | `ServerApp::onConnect()` |
| `Server::_onDisconnect` | `ServerApp::init()`:57 | `cleanupZombieClients()` | `ServerApp::onDisconnect()` |
| `Server::_onData` | `ServerApp::init()`:58 | `handleClientData()` | `ServerApp::onData()` |
| `Session::_onTeamName` | `ServerApp::onConnect()`:164 | `handleTeamName()` | `ServerApp::handleTeamJoin()` |
| `Session::_onGUI` | `ServerApp::onConnect()`:165 | `handleGUI()` | `ServerApp::handleGUIConnect()` |
| `Session::_onAICommand` | `ServerApp::onConnect()`:166 | `handleLine()`/`handleAI()` | `ServerApp::handleAICommand()` |
| `Session::_onGUICommand` | `ServerApp::onConnect()`:167 | `handleLine()` | `ServerApp::handleGUICommand()` |
| `CommandScheduler::_onActionReady` | `ServerApp::init()`:60-63 | `update()` | `ServerApp::onActionReady()` |

### Fonctions applicatives appelées via ActionHandler (`ActionHandler.cpp:34-62`)

```
switch (type) {
    FORWARD    → handleForward(player)       [l.65]
    RIGHT      → handleRight(player)         [l.89]
    LEFT       → handleLeft(player)          [l.103]
    LOOK       → handleLook(player)          [l.117]
    INVENTORY  → handleInventory(player)     [l.125]
    BROADCAST  → handleBroadcast(player,msg) [l.142]
    CONNECT_NBR→ handleConnectNbr(player)    [l.168]
    FORK       → handleFork(player)          [l.179]
    EJECT      → handleEject(player)         [l.211]
    TAKE       → handleTake(player,obj)      [l.286]
    SET        → handleSet(player,obj)       [l.316]
    INCANTATION→ handleIncantation(player)   [l.348]
}
```

---

## 4. Messages d'erreur

### Oui, il y a des messages d'erreur à tous les niveaux :

#### Erreurs système (stderr)
| Fichier | Ligne | Message |
|---------|-------|---------|
| `Server.cpp` | 28 | `fcntl nonblock failed: ...` |
| `Server.cpp` | 36 | `setsockopt failed: ...` |
| `Server.cpp` | 49 | `bind failed on port ...: ...` |
| `Server.cpp` | 55 | `listen failed: ...` |
| `Server.cpp` | 76 | `poll error: ...` |
| `Server.cpp` | 196 | `accept failed: ...` |
| `Client.cpp` | 21 | `read(...) failed: ...` |
| `Client.cpp` | 73 | `write(...) failed: ...` |

#### Erreurs de lancement (main.cpp)
- Port invalide, dimensions nulles, pas de teams, `clientsNb < 6`, `freq <= 0` → `printUsage(); return 84`
- Échec de `Server::init()` → `"Failed to start server on port ..."`

#### Réponses d'erreur aux clients AI

| Message | Signification | Où |
|---------|---------------|-----|
| `"ko\n"` | Commande inconnue, échec action, file pleine, incantation bloquée, etc. | `AIProtocol::formatKo()`, `ServerApp.cpp:212/219/289/294/300/308/332`, `ActionHandler.cpp:59/184/235/283/291/298/321/327/384/475` |
| `"dead\n"` | Joueur mort de faim | `AIProtocol::formatDead()`, `ServerApp.cpp:128`, `Session.cpp:63` |

#### Réponses d'erreur aux clients GUI

| Message | Signification | Où |
|---------|---------------|-----|
| `"suc\n"` | Unknown command | `GUIProtocol::suc()`, `ServerApp.cpp:412` |
| `"sbp\n"` | Bad parameters | `GUIProtocol::sbp()`, `ServerApp.cpp:347/351/372/377/381/385/389/394/401/403/416` |

#### Erreurs silencieuses (sans message)
- `poll()` interrompu par `EINTR` → retour silencieux
- `accept()` / `read()` / `write()` avec `EAGAIN`/`EWOULDBLOCK` → retour silencieux
- Buffer d'entrée plein → déconnexion silencieuse
- `onActionReady()` avec pointeur null → retour silencieux

**Total : 44 occurrences de messages d'erreur sur 7 fichiers sources.**
