# `include/common/Structs.hpp` — Structures de données

Définit les structures fondamentales partagées par tout le projet.

---

```cpp
struct Position {
    int x = 0;
    int y = 0;

    bool operator==(const Position &other) const {
        return x == other.x && y == other.y;
    }
};
```
**Lignes 8-15** — `Position` représente une coordonnée sur la carte. L'opérateur `==` permet de comparer deux positions.

```cpp
struct Inventory {
    std::array<int, static_cast<int>(ResourceType::COUNT)> resources = {0};

    int &operator[](ResourceType type) {
        return resources[static_cast<int>(type)];
    }

    const int &operator[](ResourceType type) const {
        return resources[static_cast<int>(type)];
    }
};
```
**Lignes 17-27** — `Inventory` est un tableau de 7 entiers (un par `ResourceType`). Les opérateurs `[]` permettent d'accéder par `ResourceType` directement, en convertissant l'enum en index entier.

```cpp
struct ElevationRequirement {
    int playersRequired;
    std::array<int, static_cast<int>(ResourceType::COUNT)> resources;
};
```
**Lignes 29-32** — `ElevationRequirement` décrit ce qu'il faut pour une incantation : un nombre minimal de joueurs et les ressources nécessaires.
