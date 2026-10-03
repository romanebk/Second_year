# Architecture du Serveur Zappy

## Vue d'ensemble

Serveur **C++ monoprocessus/monothread** utilisant `poll()` pour le multiplexage des sockets.
Le serveur gère des **clients AI** (joueurs Trantoriens) et un **client GUI** (GRAPHIC) via TCP.

---

## Structure basée sur l'existant

Les dossiers `common/`, `interfaces/` et `network/` sont **déjà présents** dans `include/`.
L'architecture s'appuie dessus sans les remplacer.

```
include/
├── common/                  # [existant]
│   ├── Constants.hpp        #   constantes du jeu
│   ├── Enums.hpp            #   énumérations (orientation, ressource, etat)
│   └── Structs.hpp          #   structures (position, inventaire)
├── interfaces/              # [existant]
│   ├── IGameEngine.hpp      #   contrat du moteur de jeu
│   └── IServer.hpp          #   contrat du serveur
├── network/                 # [existant + ajouts]
│   ├── Server.hpp           #   implémente IServer (socket, bind, listen)
│   ├── Client.hpp           #   connexion TCP + buffer entrée/sortie
│   ├── CircularBuffer.hpp   #   ring buffer I/O
│   └── Session.hpp          #   [nouveau] session après handshake (AI ou GUI)
├── protocol/                # [nouveau]
│   ├── AIProtocol.hpp       #   parse commandes AI → action
│   └── GUIProtocol.hpp      #   formatage des notifications GUI
├── game/                    # [nouveau] entités + systèmes
│   ├── Map.hpp              #   carte torique : tiles, spawn ressources
│   ├── Tile.hpp             #   une tuile : ressources, joueurs, oeufs
│   ├── Player.hpp           #   joueur : inventaire, niveau, position, équipe
│   ├── Team.hpp             #   équipe : slots, oeufs, joueurs
│   ├── Egg.hpp              #   oeuf : position, état (pondu/éclos/mort)
│   ├── ResourceManager.hpp  #   spawn périodique des ressources (densité)
│   ├── IncantationSystem.hpp #  rituel d'élévation (vérif début/fin)
│   ├── LookSystem.hpp       #   calcul du champ de vision
│   ├── BroadcastSystem.hpp  #   propagation du son (chemin le plus court)
│   └── CommandScheduler.hpp #   file d'actions avec timers (action/f)
└── ServerApp.hpp            # [nouveau] orchestrateur : init + event loop
```

```
src/
├── main.cpp                 # parse argv, instancie ServerApp, lance run()
├── network/
│   ├── Server.cpp           # implémente IServer
│   ├── Client.cpp           # [existant] à remplir
│   └── Session.cpp          # handshake + dispatch AI/GUI
├── protocol/
│   ├── AIProtocol.cpp       # parsing ligne → action + réponse
│   └── GUIProtocol.cpp      # construction messages GUI
├── game/
│   ├── Map.cpp
│   ├── Tile.cpp
│   ├── Player.cpp
│   ├── Team.cpp
│   ├── Egg.cpp
│   ├── ResourceManager.cpp
│   ├── IncantationSystem.cpp
│   ├── LookSystem.cpp
│   ├── BroadcastSystem.cpp
│   └── CommandScheduler.cpp
└── ServerApp.cpp            # implémente IGameEngine + event loop poll()
```

---

## Règles de dépendance

Les dépendances vont dans un **seul sens** :

```
network → protocol → game → common
                ↘          ↙
              interfaces (contrats)
```

- **network/** → ne connaît que `protocol/` et `interfaces/`
- **protocol/** → parse les chaînes, appelle `game/`
- **game/** → logique métier pure, ne connaît pas le réseau
- **ServerApp** → glue qui connecte tout (implémente `IGameEngine`)

---

## Design Patterns

| Pattern | Usage |
|---------|-------|
| **Event-driven** | `poll()` sur tous les sockets, pas de threads, pas de busy waiting |
| **Interface-based** | `IServer`, `IGameEngine` pour découpler les couches |
| **State** | Sessions AI/GUI avec machine à états (handshake → jeu) |
| **Command Scheduler** | File d'actions avec timer, exécution quand `timeout = action/f` écoulé |
| **Observer (push)** | GUI notifié des changements via `GUIProtocol` sans polling |

---

## Flux principal (`poll()`)

```
ServerApp::run():
┌─────────────────────────────────────────────────────┐
│  1. poll(fds, timeout calculé selon prochaine action)│
│                                                     │
│  2. si nouvelle connexion :                         │
│       → Server::accept()                            │
│       → création Client                             │
│       → envoi WELCOME\n                             │
│                                                     │
│  3. si data entrante :                              │
│       → Client lit dans CircularBuffer              │
│       → extraction ligne complète (\n)              │
│       → AIProtocol::parse() → action structurée     │
│         OU GUIProtocol::parse()                     │
│       → si handshake pas fini : continue            │
│       → sinon : CommandScheduler::schedule()        │
│                                                     │
│  4. si action prête (timeout écoulé) :              │
│       → exécution par le System correspondant       │
│         (LookSystem, IncantationSystem, etc.)       │
│       → réponse via Client::send()                  │
│       → si GUI connecté : GUIProtocol::notify()     │
│                                                     │
│  5. si tick de jeu (20 unités écoulées) :           │
│       → ResourceManager::spawn()                    │
│       → push tuiles modifiées au GUI                │
│                                                     │
│  6. si vie d'un player épuisée :                    │
│       → mort du player → pdi au GUI                 │
└─────────────────────────────────────────────────────┘
```

---

## Communication client AI (handshake)

```
[Client AI]                  [Serveur]
   |                            |
   |-------- TCP connect ------>|
   |<------ WELCOME\n ----------|   (Session créée, état AWAITING_TEAM)
   |------ TEAM_NAME\n -------->|   (vérifie team + slot disponible)
   |<------ CLIENT_NUM\n -------|   (nombre slots restants)
   |<------ X Y\n --------------|   (taille du monde)
   |                            |   (Session passe en état PLAYING)
   |------ Forward\n ---------->|   (bufferisé dans CircularBuffer)
   |                            |   (planifié dans CommandScheduler)
   |<------ ok\n ---------------|   (après 7/f secondes)
```

Si le client envoie `GRAPHIC` comme team name → session GUI au lieu d'AI.

---

## Commandes et temps d'exécution

| Action | Commande | Temps | Réponse |
|--------|----------|-------|---------|
| Avancer | `Forward` | 7/f | `ok` |
| Tourner droite | `Right` | 7/f | `ok` |
| Tourner gauche | `Left` | 7/f | `ok` |
| Regarder | `Look` | 7/f | `[tile1,...]` |
| Inventaire | `Inventory` | 1/f | `[food n, ...]` |
| Broadcast | `Broadcast text` | 7/f | `ok` |
| Connect_nbr | `Connect_nbr` | - | `value` |
| Fork | `Fork` | 42/f | `ok` |
| Eject | `Eject` | 7/f | `ok/ko` |
| Prendre | `Take obj` | 7/f | `ok/ko` |
| Poser | `Set obj` | 7/f | `ok/ko` |
| Incantation | `Incantation` | 300/f | `Elevation underway` / `Current level: k` / `ko` |

Le client peut envoyer jusqu'à **10 requêtes** sans attendre de réponse.
Au-delà, elles sont ignorées.

Action non reconnue → réponse `ko`.

---

## Protocole GUI (push)

Le serveur **pousse** les changements au GUI quand ils surviennent (pas de polling) :

| Événement | Message | Déclencheur |
|-----------|---------|-------------|
| Taille map | `msz X Y` | Connexion GUI |
| Tuile modifiée | `bct X Y q0...q6` | Respawn / action joueur |
| Toutes les tuiles | `bct ...` * n | `mct` reçu du GUI |
| Nouveau joueur | `pnw #n X Y O L N` | Connexion joueur / éclosion œuf |
| Position joueur | `ppo #n X Y O` | Déplacement |
| Niveau joueur | `plv #n L` | Incantation réussie |
| Inventaire | `pin #n X Y q0...q6` | Demande `pin` |
| Expulsion | `pex #n` | Eject |
| Broadcast | `pbc #n M` | Broadcast |
| Incantation start | `pic X Y L #n...` | Début incantation |
| Incantation end | `pie X Y R` | Fin incantation (R=0 échec, 1=succès) |
| Pondre œuf | `pfk #n` + `enw #e #n X Y` | Fork |
| Prendre ressource | `pgt #n i` | Take |
| Poser ressource | `pdr #n i` | Set |
| Mort joueur | `pdi #n` | Vie épuisée / Eject sur œuf |
| Éclosion œuf | `ebo #e` | Connexion client sur slot |
| Mort œuf | `edi #e` | Eject |
| Modification time unit | `sst T` / `sgt T` | Demande GUI / réponse |
| Fin de partie | `seg N` | Équipe gagnante (6 joueurs level 8) |
| Message serveur | `smg M` | Événement système |
| Commande inconnue | `suc` | Requête GUI invalide |
| Mauvais paramètre | `sbp` | Requête GUI mal formée |

---

## Ressources — densités et spawn

| Ressource | Densité | Quantité sur 10x10 |
|-----------|---------|-------------------|
| Food | 0.5 | 50 |
| Linemate | 0.3 | 30 |
| Deraumere | 0.15 | 15 |
| Sibur | 0.1 | 10 |
| Mendiane | 0.1 | 10 |
| Phiras | 0.08 | 8 |
| Thystame | 0.05 | 5 |

**Formule** : `largeur * hauteur * densité`

**Spawn** : au démarrage + toutes les 20 unités de temps, réparti uniformément sur la carte.

---

## Élévation (Incantation)

| Niveau | Joueurs requis | Linemate | Deraumere | Sibur | Mendiane | Phiras | Thystame |
|--------|---------------|----------|-----------|-------|----------|--------|----------|
| 1→2    | 1 | 1 | 0 | 0 | 0 | 0 | 0 |
| 2→3    | 2 | 1 | 1 | 1 | 0 | 0 | 0 |
| 3→4    | 2 | 2 | 0 | 1 | 0 | 2 | 0 |
| 4→5    | 4 | 1 | 1 | 2 | 0 | 1 | 0 |
| 5→6    | 4 | 1 | 2 | 1 | 3 | 0 | 0 |
| 6→7    | 6 | 1 | 2 | 3 | 0 | 1 | 0 |
| 7→8    | 6 | 2 | 2 | 2 | 2 | 2 | 1 |

- Vérification au **début** et à la **fin** de l'incantation
- Les joueurs sont **gelés** pendant le rituel
- Les pierres sont **consommées** (retirées de la tuile) en cas de succès
- Les joueurs de toutes équipes du même niveau peuvent participer

---

## Vie et nourriture

- 1 unité de food = 126 unités de temps de survie
- 10 unités de vie au départ = 1260 unités de temps = 1260/f secondes
- La faim est décomptée à chaque action / tick de jeu
- Plus de nourriture → `dead` → `pdi` au GUI

---

## Ordre d'implémentation

| Étape | Fichiers | Description |
|-------|----------|-------------|
| **1** | `main.cpp`, `ServerApp` | Parse args, init, boucle `poll()` vide |
| **2** | `Server`, `Client` | Socket TCP, bind, listen, accept, poll |
| **3** | `CircularBuffer` | Bufferisation I/O |
| **4** | `Session` | Handshake WELCOME, sessions AI/GUI |
| **5** | `Map`, `Tile`, `ResourceManager` | Génération & spawn du monde |
| **6** | `Team`, `Player`, `Egg` | Entités du jeu |
| **7** | `AIProtocol` | Parsing des commandes AI |
| **8** | `CommandScheduler` | File d'actions avec timers |
| **9** | `LookSystem`, `BroadcastSystem`, `IncantationSystem` | Systèmes de jeu |
| **10** | Exécution des commandes | Forward, Right, Left, Take, Set, etc. |
| **11** | `GUIProtocol` | Connexion GRAPHIC + notifications push |
| **12** | Gestion de la vie | Faim, mort, respawn |
| **13** | `CMakeLists.txt` | Build system |

---

## Makefile — règles attendues

```
make zappy_server
make zappy_gui     (partie GUI, pas ta responsabilité)
make zappy_ai      (partie AI, pas ta responsabilité)
```
