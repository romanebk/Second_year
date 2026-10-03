# Répartition des fichiers — Serveur Zappy

> **Note** : Dans les fichiers d'explications (`explications/`), les numéros de lignes mentionnés (ex: "Lignes 27-51") se réfèrent aux blocs de code **dans l'explication**, pas aux numéros de ligne des fichiers source réels.

## Ariel — Côté jeu (game + protocoles)

| Fichier | Lignes | Description |
|---|---|---|
| `src/game/ActionHandler.cpp` | 444 | Toutes les actions (Forward, Look, Broadcast, Fork, Eject, Incantation...) |
| `include/game/ActionHandler.hpp` | 77 | Header ActionHandler |
| `src/game/CommandScheduler.cpp` | 85 | Priority queue d'actions avec timers |
| `include/game/CommandScheduler.hpp` | 44 | Header CommandScheduler |
| `src/game/ResourceManager.cpp` | 54 | Spawn aléatoire de ressources |
| `include/game/ResourceManager.hpp` | 28 | Header ResourceManager |
| `src/game/IncantationSystem.cpp` | 63 | Vérifications et exécution des incantations |
| `include/game/IncantationSystem.hpp` | 16 | Header IncantationSystem |
| `src/game/LookSystem.cpp` | 79 | Calcul du cône de vision |
| `include/game/LookSystem.hpp` | 15 | Header LookSystem |
| `src/game/BroadcastSystem.cpp` | 54 | Calcul de direction (atan2) |
| `include/game/BroadcastSystem.hpp` | 13 | Header BroadcastSystem |
| `src/game/Egg.cpp` | 8 | Oeuf |
| `include/game/Egg.hpp` | 29 | Header Egg |
| `src/game/Tile.cpp` | 32 | Tuile |
| `include/game/Tile.hpp` | 39 | Header Tile |
| `src/game/Player.cpp` | 12 | Joueur |
| `include/game/Player.hpp` | 53 | Header Player |
| `src/game/Team.cpp` | 70 | Équipe |
| `include/game/Team.hpp` | 39 | Header Team |
| `src/game/Map.cpp` | 62 | Map |
| `include/game/Map.hpp` | 33 | Header Map |
| `include/game/CommandUtils.hpp` | 19 | parseResourceType |
| `include/common/Constants.hpp` | 61 | Constantes du jeu |
| `include/common/Enums.hpp` | 45 | Énumérations |
| `include/common/Structs.hpp` | 34 | Structures |
| `include/interfaces/IGameEngine.hpp` | 25 | Interface moteur de jeu |
| `include/interfaces/IMap.hpp` | 23 | Interface map |
| `include/interfaces/IPlayer.hpp` | 32 | Interface joueur |
| `src/protocol/GUIProtocol.cpp` | 155 | Formatage messages GUI |
| `include/protocol/GUIProtocol.hpp` | 43 | Header GUIProtocol |
| **Total .cpp** | **~1200** | |
| **Total headers** | **~700** | |

## Momo — Côté serveur (réseau + orchestration)

| Fichier | Lignes | Description |
|---|---|---|
| `src/network/Server.cpp` | 231 | Poll loop, accept, gestion socket |
| `include/network/Server.hpp` | 48 | Header Server |
| `src/network/Client.cpp` | 86 | Buffer entrée/sortie, back-pressure |
| `include/network/Client.hpp` | 47 | Header Client |
| `src/network/Session.cpp` | 56 | Machine à états (handshake) |
| `include/network/Session.hpp` | 47 | Header Session |
| `src/ServerApp.cpp` | 429 | Orchestrateur : init, loop, events, handlers |
| `include/ServerApp.hpp` | 74 | Header ServerApp |
| `src/main.cpp` | 69 | Parsing arguments, lancement |
| `include/interfaces/IServer.hpp` | 14 | Interface serveur |
| `src/protocol/AIProtocol.cpp` | 83 | Parsing commandes AI |
| `include/protocol/AIProtocol.hpp` | 30 | Header AIProtocol |
| **Total .cpp** | **~870** | |
| **Total headers** | **~260** | |
