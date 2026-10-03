# `include/common/Constants.hpp` — Constantes du jeu

Toutes les constantes configurables du jeu Zappy.

---

```cpp
const int DEFAULT_PORT = 4242;
const int DEFAULT_FREQ = 100;
const int MAX_CLIENTS_PER_TEAM = 10;
const int MAX_PENDING = 10;
const int MAX_COMMANDS_QUEUED = 10;
const int FOOD_UNITS = 126;
const int INITIAL_LIFE = 10;
const int SPAWN_INTERVAL = 20;
const int WIN_LEVEL = 8;
const int WIN_PLAYERS = 6;
const int EGG_HATCH_TIME = 600;
```
**Lignes 8-18** — Constantes numériques de base : port, fréquence (tick/s), taille des files, vie initiale, intervalle de spawn, condition de victoire (6 joueurs niveau 8), temps d'éclosion (600 ticks).

```cpp
const double RESOURCE_DENSITY[] = {
    0.5,   // FOOD
    0.3,   // LINEMATE
    0.15,  // DERAUMERE
    0.1,   // SIBUR
    0.1,   // MENDIANE
    0.08,  // PHIRAS
    0.05   // THYSTAME
};
```
**Lignes 20-28** — Densité de chaque ressource par tuile. Utilisé par `ResourceManager` pour calculer combien de ressources spawn.

```cpp
const int ACTION_TIME[] = {
    7,   // FORWARD
    7,   // RIGHT
    7,   // LEFT
    7,   // LOOK
    1,   // INVENTORY
    7,   // BROADCAST
    0,   // CONNECT_NBR (instant)
    42,  // FORK
    7,   // EJECT
    7,   // TAKE
    7,   // SET
    300, // INCANTATION
    0    // NONE
};
```
**Lignes 30-44** — Durée en ticks de chaque action, indexé par `ActionType`. Utilisé par `CommandScheduler` pour planifier l'exécution.

```cpp
const std::array<ElevationRequirement, 7> ELEVATION = {{
    {1,  {0, 1, 0, 0, 0, 0, 0}},  // 1->2
    {2,  {0, 1, 1, 1, 0, 0, 0}},  // 2->3
    {2,  {0, 2, 0, 1, 0, 2, 0}},  // 3->4
    {4,  {0, 1, 1, 2, 0, 1, 0}},  // 4->5
    {4,  {0, 1, 2, 1, 3, 0, 0}},  // 5->6
    {6,  {0, 1, 2, 3, 0, 1, 0}},  // 6->7
    {6,  {0, 2, 2, 2, 2, 2, 1}}   // 7->8
}};
```
**Lignes 46-54** — Tableau des 7 paliers d'élévation. Chaque entrée donne le nombre de joueurs requis et les ressources nécessaires (ordre : food, linemate, deraumere, sibur, mendiane, phiras, thystame).

```cpp
const char * const WELCOME_MSG = "WELCOME\n";
const char * const KO_MSG = "ko\n";
const char * const DEAD_MSG = "dead\n";
```
**Lignes 56-58** — Messages protocolaires standards envoyés aux clients.
