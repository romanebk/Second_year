# `include/game/Player.hpp` — Header du joueur

Définition de la classe `Player`, implémentation concrète de `IPlayer`.

---

```cpp
class Player : public IPlayer {
    public:
        Player(int id, const std::string &teamName);

        int getId() const override { return _id; }
        const std::string &getTeamName() const override { return _teamName; }
        int getLevel() const override { return _level; }
        void setLevel(int level) override { _level = level; }
        Orientation getOrientation() const override { return _orientation; }
        void setOrientation(Orientation orient) override { _orientation = orient; }
        const Position &getPosition() const override { return _pos; }
        void setPosition(const Position &pos) override { _pos = pos; }
        Tile *getTile() const override { return _tile; }
        void setTile(Tile *tile) override { _tile = tile; }
        Inventory &getInventory() override { return _inventory; }
        const Inventory &getInventory() const override { return _inventory; }
        int getLife() const override { return _life; }
        void setLife(int life) { _life = life; }
        void consumeFood() override;
        bool isDead() const override { return _life <= 0; }
        bool isIncanting() const override { return _incanting; }
        void setIncanting(bool v) override { _incanting = v; }

    private:
        int _id;
        std::string _teamName;
        int _level = 1;
        Orientation _orientation;
        Position _pos;
        Tile *_tile = nullptr;
        Inventory _inventory;
        int _life = 10;
        bool _incanting = false;
};
```
**Lignes 11-51** — Implémente les 17 méthodes de `IPlayer`. La plupart sont inline. Particularités :
- `_level` commence à 1.
- `_orientation` est NORTH par défaut.
- `_tile` est nullptr tant que le joueur n'est pas placé.
- `_life` initiale = 10 unités de food.
- `setLife()` est publique (pas dans l'interface) pour l'initialisation.
