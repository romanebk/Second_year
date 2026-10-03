# `include/interfaces/IMap.hpp` — Interface de la carte

Interface abstraite pour la carte, utilisée par `ResourceManager`, `LookSystem`, `BroadcastSystem`, etc.

---

```cpp
virtual int getWidth() const = 0;
virtual int getHeight() const = 0;
virtual Tile &getTile(int x, int y) = 0;
virtual const Tile &getTile(int x, int y) const = 0;
virtual Tile &getTile(const Position &pos) = 0;
virtual Position wrap(int x, int y) const = 0;
virtual Position wrap(const Position &pos) const = 0;
virtual std::vector<std::reference_wrapper<Tile>> getAllTiles() = 0;
virtual std::vector<std::reference_wrapper<const Tile>> getAllTiles() const = 0;
```
**Lignes 12-20** — Interface complète : dimensions, accès aux tuiles par coordonnées ou Position, wrapping torique, et itération sur toutes les tuiles (versions mutable et const).
