# `include/common/Enums.hpp` — Énumérations

Ce fichier définit toutes les énumérations utilisées par le moteur de jeu.

---

```cpp
enum class ResourceType {
    FOOD = 0,
    LINEMATE,
    DERAUMERE,
    SIBUR,
    MENDIANE,
    PHIRAS,
    THYSTAME,
    COUNT
};
```
**Lignes 4-13** — `ResourceType` énumère les 7 types de ressources (Food + 6 minéraux). `COUNT` (valeur 7) sert de sentinelle pour itérer ou borner les tableaux.

```cpp
enum class Orientation {
    NORTH = 1,
    EAST = 2,
    SOUTH = 3,
    WEST = 4
};
```
**Lignes 15-20** — `Orientation` représente les 4 directions cardinales. Les valeurs 1-4 sont imposées par le protocole Zappy.

```cpp
enum class ClientState {
    AWAITING_TEAM,
    AWAITING_SLOT,
    PLAYING,
    DEAD
};
```
**Lignes 22-27** — `ClientState` représente les états d'un client réseau : en attente de son équipe, en attente de slot, en jeu, ou mort.

```cpp
enum class ActionType {
    FORWARD,
    RIGHT,
    LEFT,
    LOOK,
    INVENTORY,
    BROADCAST,
    CONNECT_NBR,
    FORK,
    EJECT,
    TAKE,
    SET,
    INCANTATION,
    NONE
};
```
**Lignes 29-43** — `ActionType` liste toutes les actions possibles d'un joueur. `NONE` sert de valeur par défaut / sentinelle.
