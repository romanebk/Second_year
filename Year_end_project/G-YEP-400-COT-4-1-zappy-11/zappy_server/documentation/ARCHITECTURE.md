# Architecture du Serveur Zappy

## Vue d'ensemble

Le serveur Zappy est un programme C++17 monothreadé basé sur `poll()`.
Il suit une architecture en couches :

```
┌──────────────────────────────────────────────────────────────┐
│                     ServerApp (moteur)                        │
│  Orchestre tout : init → run() → update() → stop()           │
├──────────────────────────────────────────────────────────────┤
│                    Couche Réseau                              │
│  Server (poll/epoll) → Client (buffers) → Session (état)     │
├──────────────────────────────────────────────────────────────┤
│                   Couche Protocole                            │
│  AIProtocol (parsing/format) ←→ GUIProtocol (parsing/format)│
├──────────────────────────────────────────────────────────────┤
│                    Couche Jeu                                 │
│  Map/Tile ─ Player/Team/Egg ─ IncantationSystem              │
│  LookSystem ─ BroadcastSystem ─ ResourceManager              │
│  CommandScheduler ─ ActionHandler                             │
└──────────────────────────────────────────────────────────────┘
```

## Cycle de vie

```
main()
  │
  ├─ ServerApp::init()          # Crée map, équipes, ressources, callbacks
  ├─ ServerApp::initNetwork()   # bind + listen
  ├─ ServerApp::run()
  │    │
  │    └─ boucle:
  │         ├─ getTimeUntilNextEvent()  # temps d'attente optimal
  │         ├─ Server::run(timeout)     # poll() + I/O
  │         └─ ServerApp::update(dt)    # logique jeu
  │
  └─ ServerApp::stop()          # cleanup
```

## Couche Réseau

### Server (`network/Server.hpp`, `network/Server.cpp`)

- Une seule socket TCP non-bloquante (`O_NONBLOCK`)
- `SO_REUSEADDR` pour redémarrage rapide
- Boucle `poll()` avec timeout calculé dynamiquement
- Mélange socket serveur + clients + stdin (EOF → stop)
- `rebuildPollFds()` reconstruit le tableau après chaque ajout/suppression
- `cleanupZombieClients()` purge les clients déconnectés (fd < 0)

### Client (`network/Client.hpp`, `network/Client.cpp`)

- Buffers ligne par ligne (`_inBuffer` / `_outBuffer`)
- `pushLine()` → file d'envoi, `popLine()` → file de réception
- Protection anti-overflow (64 Ko out, 128 Ko in)
- `disconnect()` → ferme fd, garde l'objet pour cleanup différé

### Session (`network/Session.hpp`, `network/Session.cpp`)

- Machine à états du handshake : `WELCOME` → `GRAPHIC` ou `teamName`
- Callbacks : `onTeamName`, `onGUI`, `onAICommand`, `onGUICommand`
- Router les lignes entrantes vers le bon handler

## Couche Protocole

### AIProtocol (`protocol/AIProtocol.hpp`, `protocol/AIProtocol.cpp`)

Parsing des commandes AI + formatage des réponses :

| Commande AI | ActionType | Temps (ticks) |
|-------------|-----------|--------------|
| `Forward` | FORWARD | 7 |
| `Right` | RIGHT | 7 |
| `Left` | LEFT | 7 |
| `Look` | LOOK | 7 |
| `Inventory` | INVENTORY | 1 |
| `Broadcast texte` | BROADCAST | 7 |
| `Connect_nbr` | CONNECT_NBR | 0 |
| `Fork` | FORK | 42 |
| `Eject` | EJECT | 7 |
| `Take objet` | TAKE | 7 |
| `Set objet` | SET | 7 |
| `Incantation` | INCANTATION | 300 |

### GUIProtocol (`protocol/GUIProtocol.hpp`, `protocol/GUIProtocol.cpp`)

Formatage des événements push (serveur → GUI) :

| Événement | Signification |
|-----------|--------------|
| `msz x y` | Taille de la carte |
| `bct x y r0..r6` | Contenu d'une tuile |
| `tna name` | Nom d'équipe |
| `pnw #id x y o l team` | Nouveau joueur |
| `ppo #id x y o` | Position joueur |
| `plv #id l` | Niveau joueur |
| `pin #id x y r0..r6` | Inventaire joueur |
| `pex #id` | Expulsion |
| `pbc #id msg` | Broadcast |
| `pic x y l #id...` | Début incantation |
| `pie x y r` | Fin incantation (r=0/1) |
| `pfk #id` | Pondre un œuf |
| `pdr #id r` | Déposer ressource |
| `pgt #id r` | Prendre ressource |
| `pdi #id` | Joueur mort |
| `enw #eid #pid x y` | Œuf pondu |
| `ebo #eid` | Œuf éclos |
| `edi #eid` | Œuf mort |
| `sgt t` | Time unit actuel |
| `sst t` | Time unit changé |
| `seg team` | Équipe gagnante |
| `smg msg` | Message serveur |
| `suc` | Commande inconnue |
| `sbp` | Paramètre invalide |

Requêtes GUI (GUI → serveur) : `msz`, `bct`, `mct`, `tna`, `ppo`, `plv`, `pin`, `sgt`, `sst`

## Couche Jeu

### Map / Tile (`game/Map.hpp`, `game/Tile.hpp`)

- Grille 2D de `Tile`
- Wrap toroïdal (`wrap()`)
- Chaque Tile contient : inventaire ressources, pointeurs joueurs, pointeurs œufs

### Player / Team / Egg

- **Player** : inventaire, niveau, orientation, position, flag incanting
- **Team** : slots max, liste joueurs, liste œufs, `getFreeSlots()`
- **Egg** : état `_hatched` / `_dead` / `_consumed`, `consume()` pour join

### IncantationSystem (`game/IncantationSystem.hpp`)

Système static en 3 étapes :
1. `checkRequirements()` — vérifie ressources + joueurs sur la tuile
2. `getEligiblePlayers()` — liste les joueurs éligibles (même niveau - 1, pas incanting)
3. `performIncantation()` — consomme ressources, valide le compte

### LookSystem / BroadcastSystem

- **LookSystem** : vision en cône selon orientation (inspiré de l'énoncé)
- **BroadcastSystem** : calcul de direction entre deux positions sur tore

### CommandScheduler (`game/CommandScheduler.hpp`)

File prioritaire (`priority_queue`) d'actions triées par `remainingTime` :
- `schedule()` → ajoute une action avec le bon temps (`Constants::ACTION_TIME[type] / freq`)
- `update(dt)` → décrémente, déclenche `onActionReady` quand temps écoulé
- `clearPlayerActions()` → annule toutes les actions d'un joueur
- Garantie : max 10 actions en file par joueur (`MAX_COMMANDS_QUEUED`)

### ActionHandler (`game/ActionHandler.hpp`)

Point d'entrée unique pour exécuter une action :
- `execute(player, type, args)` → dispatch vers `handleForward`, `handleTake`, etc.
- Chaque handler modifie l'état du jeu + envoie les notifications GUI
- `handleIncantation()` gère la fin de l'incantation (succès/échec)
- `checkEggHatches()` gère le timer d'éclosion (600 ticks)

### ResourceManager (`game/ResourceManager.hpp`)

- Distribution aléatoire initiale des ressources sur la carte
- Respawn périodique (`Constants::SPAWN_INTERVAL / freq`)
- Densités par type : FOOD=0.5, LINEMATE=0.3, DERAUMERE=0.15, SIBUR=0.1, MENDIANE=0.1, PHIRAS=0.08, THYSTAME=0.05

## Flux de données typique

### Connexion AI
```
Client → Server::acceptNewClient() → Session::handleWelcome()
  → Client reçoit "WELCOME\n"
  → Client envoie "TeamName\n"
  → Session::handleTeamName() → ServerApp::handleTeamJoin()
    → Team::getFreeSlots() / Team::getAvailableEgg()
    → Création Player + ajout à la map
    → Envoi "slotCount\n X Y\n"
    → GUI reçoit "pnw #id x y o l team"
```

### Connexion GUI
```
Client → Server::acceptNewClient() → Session::handleWelcome()
  → Client envoie "GRAPHIC\n"
  → Session::handleGUI() → ServerApp::handleGUIConnect()
    → Envoi msz + bct (toutes tuiles) + tna + pnw + enw + sgt
```

### Exécution commande
```
AI envoie "Forward\n"
  → Client::onReadable() → ServerApp::onData()
  → Session::handleLine() → ServerApp::handleAICommand()
  → AIProtocol::parse("Forward") → ActionType::FORWARD
  → CommandScheduler::schedule(player, FORWARD, {})
  → (plus tard) CommandScheduler::update() → onActionReady()
  → ActionHandler::execute() → handleForward()
    → Player déplacé, GUI notifié via "ppo"
```

## Gestion de la mémoire

- `_players` : `vector<unique_ptr<Player>>` — propriété unique
- `_eggs` : `vector<unique_ptr<Egg>>` — propriété unique
- `_sessions` : `map<int, Session*>` — propriété manuelle (delete dans onDisconnect)
- `_teams` : `vector<Team>` — contient des pointeurs bruts vers Player et Egg
- Les pointeurs bruts dans Team/Tile sont invalidés si l'objet est détruit
- Un joueur mort n'est pas retiré immédiatement de `_players` : il reçoit "dead\n", est déconnecté, puis le cleanup se fait dans `onDisconnect()`
