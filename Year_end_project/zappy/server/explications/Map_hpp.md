# `include/game/Map.hpp` — Header de la carte

Implémentation concrète de `IMap` : une grille 2D de `Tile`.

---

```cpp
class Map : public IMap {
    public:
        Map(int width, int height);

        int getWidth() const override { return _width; }
        int getHeight() const override { return _height; }

        Tile &getTile(int x, int y) override;
        const Tile &getTile(int x, int y) const override;
        Tile &getTile(const Position &pos) override;

        Position wrap(int x, int y) const override;
        Position wrap(const Position &pos) const override;

        std::vector<std::reference_wrapper<Tile>> getAllTiles() override;
        std::vector<std::reference_wrapper<const Tile>> getAllTiles() const override;

    private:
        int _width;
        int _height;
        std::vector<std::vector<Tile>> _grid;
};
```
**Lignes 10-31** — `Map` stocke une grille `_grid[hauteur][largeur]`. Les getters retournent des `Tile&`. Le wrapping est torique : les coordonnées hors-limite sont repliées.
