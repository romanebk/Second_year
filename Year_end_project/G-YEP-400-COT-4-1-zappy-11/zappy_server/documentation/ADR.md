# Architecture Decision Records (ADR)

## ADR-001 : Choix de l'architecture monothreadée avec `poll()`

**Statut** : Accepté  
**Contexte** : Le serveur doit gérer simultanément des connexions AI (nombreuses) et GUI (1-2), avec une boucle de jeu temps réel.  
**Décision** : Serveur monothreadé avec `poll()` non-bloquant, pas de threads, pas d'async.  
**Conséquences** :
- Pas de synchronisation, pas de mutex, pas de data races
- La boucle `run()` alterne I/O et logique jeu dans le même thread
- Le timeout de `poll()` est calculé dynamiquement (prochaine action du scheduler, spawn, food, éclosion)
- Si une action I/O prend trop de temps, le jeu décroche (risque maîtrisé : les opérations sont instantanées)
- Alternative écartée : `epoll` (pas nécessaire pour < 1000 clients), multithreading (complexité inutile)

## ADR-002 : Architecture par callbacks

**Statut** : Accepté  
**Contexte** : Le `Server::run()` est générique (poll, read, write). Il ne doit pas connaître la logique jeu.  
**Décision** : `Server` expose des callbacks (`onConnect`, `onDisconnect`, `onData`, `onStdinEOF`). `ServerApp` les injecte via `setOn*()`.  
**Conséquences** :
- `Server` réutilisable, testable
- `ServerApp` reste le seul orchestrateur
- Les callbacks sont appelés depuis `Server::run()` → pas de reentrance problématique

## ADR-003 : `consume()` au lieu de `removeEgg()` pour les œufs

**Statut** : Accepté  
**Contexte** : Quand un joueur rejoignait via un œuf, l'œuf était tué + retiré de `_eggs`. Cela faisait perdre 2 slots dans `getFreeSlots()` (1 pour le joueur ajouté, 1 pour l'œuf retiré).  
**Décision** : Ajout d'un état `_consumed` sur Egg. `consume()` marque l'œuf comme consommé sans le retirer. `getFreeSlots()` compte les œufs consommés séparément.  
**Conséquences** :
- `getFreeSlots()` reste cohérent : `_maxSlots - players + hatchedAlive + consumed - unhatchedAlive`
- L'œuf reste dans la liste pour le décompte, n'est plus disponible via `getAvailableEgg()`
- Fix du bug `freeSlots` négatif (commit `114ef90`)

## ADR-004 : Vérification `isIncanting()` dans `checkRequirements()` mais pas dans `performIncantation()`

**Statut** : Accepté  
**Contexte** : L'incantation dure 300 ticks. `checkRequirements()` est appelée au début (recrute des joueurs libres), `performIncantation()` 300 ticks plus tard (vérifie les participants toujours là).  
**Décision** : `checkRequirements()` filtre les joueurs déjà en incantation (`!isIncanting()`). `performIncantation()` ne le fait pas car les participants sont marqués `incanting=true` pendant les 300 ticks.  
**Conséquences** :
- Bug critique évité : avant la correction, `performIncantation()` vérifiait `!isIncanting()` → `eligibleCount=0` → `ko` systématique
- `performIncantation()` vérifie : joueur non mort, bon niveau, même tuile

## ADR-005 : Handshake en deux phases (WELCOME → team/GRAPHIC)

**Statut** : Accepté  
**Contexte** : Le protocole Zappy exige que tout client reçoive `WELCOME\n` à la connexion, puis envoie soit un nom d'équipe (AI) soit `GRAPHIC` (GUI).  
**Décision** : `Session::handleWelcome()` envoie `WELCOME\n`. `Session::handleLine()` détecte la première ligne : si `GRAPHIC`, mode GUI ; sinon, nom d'équipe.  
**Conséquences** :
- Un seul point d'entrée pour toutes les connexions
- `Session` devient la machine à états du handshake
- Impossible de confondre une AI et un GUI après handshake

## ADR-006 : Timers virtuels basés sur la fréquence

**Statut** : Accepté  
**Contexte** : Le serveur a une fréquence (`-f freq`) qui définit la vitesse du jeu. Les actions, le spawn, la nourriture, les œufs ont des temps exprimés en ticks.  
**Décision** : Tous les délais sont divisés par `freq` pour obtenir des secondes réelles. Ex : `ACTION_TIME[FORWARD] = 7` → `7.0 / freq` secondes.  
**Conséquences** :
- `freq=100` → 1 tick = 10 ms
- `freq=1` → 1 tick = 1 s (ralenti)
- La boucle principale calcule le timeout `poll()` à partir du plus petit temps restant
- `CommandScheduler`, `ResourceManager`, `foodTimer`, `PendingEgg` utilisent tous le même mécanisme

## ADR-007 : Propriété unique avec pointeurs bruts pour les références croisées

**Statut** : Accepté  
**Contexte** : Les objets `Player` et `Egg` doivent être accessibles depuis plusieurs entités (Tile, Team, Session, ActionHandler).  
**Décision** : `_players` et `_eggs` sont des `vector<unique_ptr<T>>` (propriétaire unique). Toutes les autres références sont des pointeurs bruts.  
**Conséquences** :
- Pas de shared_ptr/weak_ptr (surcharge inutile)
- Nécessite une discipline stricte : ne pas accéder à un pointeur brut après destruction
- Destruction explicite dans `onDisconnect()` : retrait de Team, Tile, sessions
- Risque maîtrisé car la destruction est synchrone dans la boucle principale

## ADR-008 : GUI Protocol pusher au lieu de pull (sauf requêtes)

**Statut** : Accepté  
**Contexte** : Le GUI a besoin d'être notifié de tous les événements (mouvement, mort, incantation) sans polling.  
**Décision** : `broadcastToGUI()` pousse les événements à toutes les sessions GUI. Les requêtes (msz, bct, etc.) sont en pull.  
**Conséquences** :
- Le GUI reçoit `pnw`, `ppo`, `pdi`, etc. en temps réel
- `broadcastToGUI()` itère toutes les sessions et vérifie `isGUI()`
- Pas de file d'attente séparée : les messages sont dans `Client::_outBuffer`

## ADR-009 : Gestion différée des déconnexions

**Statut** : Accepté  
**Contexte** : Quand un client se déconnecte, son fd devient -1. On ne peut pas supprimer l'objet immédiatement dans `poll()`.  
**Décision** : `Client::disconnect()` ferme le fd et le passe à -1. `cleanupZombieClients()` (appelé après `poll()`) purge les clients avec `fd < 0` et appelle `onDisconnect`.  
**Conséquences** :
- Pas de suppression pendant l'itération de `poll()`
- `onDisconnect` peut accéder à `_sessions`, `_players`, `_teams` en toute sécurité
- `rebuildPollFds()` est appelé après nettoyage pour éviter fd invalide dans le tableau (fix `114ef90`)

## ADR-010 : Pas de dépendances externes (sauf libc++)

**Statut** : Accepté  
**Contexte** : Le projet EPITECH impose des contraintes de compilation minimales.  
**Décision** : C++17 standard uniquement, pas de Boost, pas d'ASIO, pas d'OpenSSL.  
**Conséquences** :
- Makefile simple : `g++ -std=c++17 -Wall -Wextra`
- Pas de gestionnaire de paquets, pas de CMake (le CMakeLists.txt du GUI est vide)
- Pas de TLS (le protocole est en clair, ce qui est normal pour un jeu LAN)
