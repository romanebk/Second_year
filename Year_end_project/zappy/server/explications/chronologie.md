# Chronologie de révision — Partie Ariel (jeu + protocoles)

Ordre recommandé pour étudier le code, du plus fondamental au plus haut niveau.

---

## Étape 1 — Fondations (structures & constantes)

Ces fichiers définissent les types de base utilisés partout.

| Ordre | Fichier | Pourquoi |
|-------|---------|----------|
| 1 | `Structs.hpp` | `Position`, `Inventory`, `ElevationRequirement` — tout le reste les utilise |
| 2 | `Enums.hpp` | `ResourceType`, `Orientation`, `ActionType` — les enum du jeu |
| 3 | `Constants.hpp` | Toutes les constantes (durées, densités, paliers d'élévation) |

---

## Étape 2 — Interfaces (contrats)

Les interfaces que le code "Momo" utilise pour piloter le jeu sans connaître l'implémentation.

| Ordre | Fichier | Pourquoi |
|-------|---------|----------|
| 4 | `IMap.hpp` | Contrat de la carte |
| 5 | `IPlayer.hpp` | Contrat du joueur |
| 6 | `IGameEngine.hpp` | Contrat du moteur de jeu (point d'entrée pour ServerApp) |

---

## Étape 3 — Entités de base

Les classes concrètes qui implémentent les données du jeu.

| Ordre | Fichier | Pourquoi |
|-------|---------|----------|
| 7 | `Tile.hpp` / `Tile.cpp` | Une case de la carte : ressources, joueurs, œufs |
| 8 | `Egg.hpp` / `Egg.cpp` | Œuf (éclosion, mort) |
| 9 | `Player.hpp` / `Player.cpp` | Joueur (position, inventaire, niveau, faim) |
| 10 | `Team.hpp` / `Team.cpp` | Équipe (slots, joueurs, œufs, condition de victoire) |
| 11 | `Map.hpp` / `Map.cpp` | Grille 2D de tuiles, wrapping torique |

---

## Étape 4 — Systèmes de jeu (logique pure)

Des classes statiques ou autonomes qui implémentent des mécaniques spécifiques.

| Ordre | Fichier | Pourquoi |
|-------|---------|----------|
| 12 | `CommandUtils.hpp` | Utilitaire : `parseResourceType()` (string → enum) |
| 13 | `LookSystem.hpp` / `LookSystem.cpp` | Calcul du cône de vision et formatage |
| 14 | `BroadcastSystem.hpp` / `BroadcastSystem.cpp` | Calcul de direction (atan2, wrapping) |
| 15 | `IncantationSystem.hpp` / `IncantationSystem.cpp` | Vérification et exécution des incantations |
| 16 | `CommandScheduler.hpp` / `CommandScheduler.cpp` | File de priorité avec timers (planification d'actions) |
| 17 | `ResourceManager.hpp` / `ResourceManager.cpp` | Spawn et maintien des ressources sur la carte |

---

## Étape 5 — Hub central (ActionHandler)

Point d'entrée unique de toutes les actions joueur. C'est le fichier le plus important.

| Ordre | Fichier | Pourquoi |
|-------|---------|----------|
| 18 | `ActionHandler.hpp` | Header : voir la liste de toutes les méthodes |
| 19 | `ActionHandler.cpp` | Implémentation de toutes les actions (444 lignes) |

Sous-ordre recommandé pour `ActionHandler.cpp` :
1. Constructeur et `execute()` (dispatch)
2. `handleForward` / `handleRight` / `handleLeft` (déplacement)
3. `handleLook` / `handleInventory` (observation)
4. `handleBroadcast` (communication)
5. `handleConnectNbr` / `handleFork` (gestion équipe)
6. `handleEject` (expulsion + destruction œufs)
7. `handleTake` / `handleSet` (ressources)
8. `handleIncantation` (élévation)
9. `checkWinCondition` / `checkEggHatches` / `broadcastToGUI` / `broadcastToAll`

---

## Étape 6 — Protocole GUI

Formatage des messages envoyés à l'interface graphique.

| Ordre | Fichier | Pourquoi |
|-------|---------|----------|
| 20 | `GUIProtocol.hpp` | Header : liste de toutes les commandes |
| 21 | `GUIProtocol.cpp` | Implémentation : `msz`, `bct`, `pnw`, `ppo`, `pic`, etc. |

---

## Résumé visuel

```
Structs → Enums → Constants                  (fondations)
    ↓
IMap → IPlayer → IGameEngine                 (interfaces)
    ↓
Tile → Egg → Player → Team → Map            (entités)
    ↓
CommandUtils → LookSystem → BroadcastSystem
→ IncantationSystem → CommandScheduler
→ ResourceManager                            (systèmes)
    ↓
ActionHandler                                (hub central)
    ↓
GUIProtocol                                  (protocole)
```
