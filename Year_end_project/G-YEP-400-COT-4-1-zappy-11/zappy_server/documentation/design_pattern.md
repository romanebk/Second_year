# Design Patterns utilisés dans zappy_server

**Total : 8 patterns de conception identifiés**

---

## 1. Strategy

`ActionHandler::execute()` dispatche vers les méthodes `handleForward()`, `handleRight()`, `handleLeft()`, `handleLook()`, `handleInventory()`, `handleBroadcast()`, `handleConnectNbr()`, `handleFork()`, `handleEject()`, `handleTake()`, `handleSet()`, `handleIncantation()` selon le `ActionType`. Chaque méthode encapsule un comportement spécifique et interchangeable.

- **Fichiers :** `include/game/ActionHandler.hpp`, `src/game/ActionHandler.cpp`

---

## 2. Command

`CommandScheduler` encapsule les actions en objets `ScheduledAction` (player, type, args, remainingTime), les stocke dans une `priority_queue` ordonnée par temps restant, et les exécute de manière différée via `ActionCallback` lorsque leur timer expire. Implémente une file d'attente priorisée avec un maximum de 10 commandes par joueur.

- **Fichiers :** `include/game/CommandScheduler.hpp`, `src/game/CommandScheduler.cpp`

---

## 3. Observer / Callback

Multiples injections de callbacks pour découpler les composants :

| Émetteur | Callback | Utilisation |
|----------|----------|-------------|
| `Server` | `setOnConnect()` | Prévenir `ServerApp` d'une nouvelle connexion |
| `Server` | `setOnDisconnect()` | Prévenir `ServerApp` d'une déconnexion |
| `Server` | `setOnData()` | Transmettre les données reçues |
| `Server` | `setOnStdinEOF()` | Signaler la fermeture de stdin |
| `CommandScheduler` | `setOnActionReady()` | Déclencher l'exécution d'une action programmée |
| `Session` | `setOnTeamName()` | Notifier la sélection d'équipe |
| `Session` | `setOnGUI()` | Notifier une connexion GUI |
| `Session` | `setOnAICommand()` | Router une commande AI |
| `Session` | `setOnGUICommand()` | Router une commande GUI |
| `ResourceManager` | `setOnSpawn()` | Notifier le spawn de ressources |

- **Fichiers :** `include/network/Server.hpp`, `include/network/Session.hpp`, `include/game/CommandScheduler.hpp`, `include/game/ResourceManager.hpp`

---

## 4. State

`Client` possède une machine à états avec `ClientState` (AWAITING_TEAM → AWAITING_SLOT → PLAYING → DEAD) qui détermine le comportement du client au fil de sa vie.

`Session` implémente une machine à états de handshake en deux phases : envoi de `WELCOME\n` → réception du nom d'équipe (AI) ou `GRAPHIC` (GUI) → routage vers le mode approprié.

- **Fichiers :** `include/common/Enums.hpp`, `include/network/Client.hpp`, `include/network/Session.hpp`, `src/network/Session.cpp`

---

## 5. Facade

`ServerApp` unifie la complexité du système entier (réseau, moteur de jeu, scheduling, gestion des ressources, protocoles AI et GUI) derrière une interface simple : `init()`, `run()`, `stop()`, `update()`. Cache les interactions entre `Server`, `Map`, `Player`, `Team`, `Egg`, `CommandScheduler`, `ActionHandler`, `ResourceManager`, `AIProtocol` et `GUIProtocol`.

- **Fichiers :** `include/ServerApp.hpp`, `src/ServerApp.cpp`

---

## 6. Template Method

Les interfaces abstraites définissent le squelette des algorithmes, les classes concrètes fournissent les implémentations :

| Interface | Implémentation | Rôle |
|-----------|---------------|------|
| `IServer` | `Server` | Gestion réseau (poll, accept, read/write) |
| `IPlayer` | `Player` | État et comportement du drone |
| `IMap` | `Map` | Grille torique et gestion des tiles |
| `IGameEngine` | `ServerApp` | Moteur de jeu complet |

- **Fichiers :** `include/interfaces/*.hpp`, `include/network/Server.hpp`, `include/game/Player.hpp`, `include/game/Map.hpp`, `include/ServerApp.hpp`

---

## 7. Singleton (Utility Class)

Classes composées uniquement de méthodes statiques, agissant comme des helpers/utilitaires sans état :

| Classe | Méthodes |
|--------|----------|
| `AIProtocol` | `parse()`, `formatWelcome()`, `formatOk()`, `formatKo()`, `formatDead()`, etc. |
| `GUIProtocol` | `parse()`, `msz()`, `bct()`, `pnw()`, `ppo()`, `pdi()`, `seg()`, etc. |
| `IncantationSystem` | `checkRequirements()`, `performIncantation()`, `getEligiblePlayers()` |

- **Fichiers :** `include/protocol/AIProtocol.hpp`, `include/protocol/GUIProtocol.hpp`, `include/game/IncantationSystem.hpp`

---

## 8. Mediator

`ServerApp` fait office de médiateur entre la couche réseau (`Server`, `Session`, `Client`) et le moteur de jeu (`Map`, `Player`, `Team`, `ActionHandler`, `CommandScheduler`, `ResourceManager`). Les composants réseau et jeu ne communiquent jamais directement : toutes les interactions transitent par `ServerApp` via les callbacks et les méthodes dédiées (`onConnect()`, `onDisconnect()`, `onData()`, `onActionReady()`, `handleTeamJoin()`, `handleAICommand()`, `handleGUICommand()`, `broadcastToGUI()`).

- **Fichiers :** `include/ServerApp.hpp`, `src/ServerApp.cpp`
