# `src/game/Player.cpp` — Implémentation du joueur

22 lignes, seules les méthodes non-triviales sont ici.

---

```cpp
Player::Player(int id, const std::string &teamName)
    : _id(id), _teamName(teamName), _orientation(Orientation::NORTH) {}
```
**Ligne 5-6** — Constructeur : initialise l'ID, l'équipe, et l'orientation à NORTH.

```cpp
void Player::consumeFood()
{
    if (_inventory[ResourceType::FOOD] > 0) {
        _inventory[ResourceType::FOOD]--;
    } else if (_life > 0) {
        _life--;
    }
}
```
**Lignes 8-14** — Consommation périodique de nourriture (appelée par la boucle de jeu) :

1. **Si l'inventaire contient de la food** (`_inventory[FOOD] > 0`) : on en retire une unité, `_life` reste intact.
2. **Sinon** : on entame `_life`. Quand `_life` atteint 0, `isDead()` retourne `true`.

Le joueur commence avec 10 food + 10 vie, soit ~25 secondes d'autonomie.
