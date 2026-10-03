# `src/game/Map.cpp` — Implémentation de la carte

62 lignes.

---

```cpp
Map::Map(int width, int height)
    : _width(width), _height(height), _grid(height, std::vector<Tile>(width))
{
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            _grid[y][x].setPosition(x, y);
        }
    }
}
```
**Lignes 3-11** — Constructeur : alloue `_grid` comme un vecteur de `height` lignes, chaque ligne contenant `width` tuiles. Puis initialise la position de chaque tuile.

```cpp
Tile &Map::getTile(int x, int y)
{
    Position p = wrap(x, y);
    return _grid[p.y][p.x];
}
```
**Lignes 13-17** — Accès à une tuile par coordonnées, avec wrapping automatique.

```cpp
const Tile &Map::getTile(int x, int y) const
{
    Position p = wrap(x, y);
    return _grid[p.y][p.x];
}
```
**Lignes 19-23** — Version const du getter.

```cpp
Tile &Map::getTile(const Position &pos)
{
    Position p = wrap(pos);
    return _grid[p.y][p.x];
}
```
**Lignes 25-29** — Surcharge acceptant un objet `Position`.

```cpp
Position Map::wrap(int x, int y) const
{
    return {((x % _width) + _width) % _width,
            ((y % _height) + _height) % _height};
}
```
**Lignes 31-35** — Wrapping torique : `((x % w) + w) % w` garantit un résultat dans [0, w-1] même pour les valeurs négatives.

```cpp
Position Map::wrap(const Position &pos) const
{
    return wrap(pos.x, pos.y);
}
```
**Lignes 37-40** — Surcharge pour `Position`.

```cpp
std::vector<std::reference_wrapper<Tile>> Map::getAllTiles()
{
    std::vector<std::reference_wrapper<Tile>> tiles;
    for (auto &row : _grid) {
        for (auto &tile : row)
            tiles.push_back(std::ref(tile));
    }
    return tiles;
}
```
**Lignes 42-50** — Version mutable : retourne toutes les tuiles par référence dans un vecteur. Utilisé par `ResourceManager` pour itérer sur toutes les tuiles.

```cpp
std::vector<std::reference_wrapper<const Tile>> Map::getAllTiles() const
{
    std::vector<std::reference_wrapper<const Tile>> tiles;
    for (const auto &row : _grid) {
        for (const auto &tile : row)
            tiles.push_back(std::ref(tile));
    }
    return tiles;
}
```
**Lignes 52-60** — Version const du même accès.
