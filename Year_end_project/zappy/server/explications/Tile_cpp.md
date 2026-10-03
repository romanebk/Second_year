# `src/game/Tile.cpp` — Implémentation de la tuile

32 lignes, 4 méthodes manipulant les listes de joueurs et d'œufs.

---

```cpp
void Tile::addPlayer(Player *player)
{
    if (player && std::find(_players.begin(), _players.end(), player) == _players.end()) {
        _players.push_back(player);
        player->setTile(this);
    }
}
```
**Lignes 4-10** — Ajoute un joueur à la tuile après vérification : le pointeur doit être valide et le joueur ne doit pas déjà être présent. Met à jour `player->_tile` vers cette tuile.

```cpp
void Tile::removePlayer(Player *player)
{
    auto it = std::find(_players.begin(), _players.end(), player);
    if (it != _players.end()) {
        _players.erase(it);
        player->setTile(nullptr);
    }
}
```
**Lignes 12-19** — Retire un joueur de la tuile. Met `player->_tile` à `nullptr` pour signaler qu'il n'est plus sur une tuile (transitoire pendant un déplacement).

```cpp
void Tile::addEgg(Egg *egg)
{
    if (egg && std::find(_eggs.begin(), _eggs.end(), egg) == _eggs.end())
        _eggs.push_back(egg);
}
```
**Lignes 21-25** — Ajoute un œuf, avec vérification de doublon.

```cpp
void Tile::removeEgg(Egg *egg)
{
    auto it = std::find(_eggs.begin(), _eggs.end(), egg);
    if (it != _eggs.end())
        _eggs.erase(it);
}
```
**Lignes 27-32** — Retire un œuf de la tuile (quand il est piétiné ou éclos).
