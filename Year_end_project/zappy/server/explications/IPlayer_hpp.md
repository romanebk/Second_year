# `include/interfaces/IPlayer.hpp` — Interface joueur

Interface abstraite pour un joueur. Permet de découpler l'implémentation concrète (`Player`) du reste du code.

---

```cpp
virtual int getId() const = 0;
virtual const std::string &getTeamName() const = 0;
virtual int getLevel() const = 0;
virtual void setLevel(int level) = 0;
virtual Orientation getOrientation() const = 0;
virtual void setOrientation(Orientation orient) = 0;
virtual const Position &getPosition() const = 0;
virtual void setPosition(const Position &pos) = 0;
virtual Tile *getTile() const = 0;
virtual void setTile(Tile *tile) = 0;
virtual Inventory &getInventory() = 0;
virtual const Inventory &getInventory() const = 0;
virtual int getLife() const = 0;
virtual void consumeFood() = 0;
virtual bool isDead() const = 0;
virtual bool isIncanting() const = 0;
virtual void setIncanting(bool v) = 0;
```
**Lignes 20-36** — 17 méthodes virtuelles pures + 1 destructeur virtuel, définissant le contrat d'un joueur : identité, niveau, orientation, position, tuile courante, inventaire, cycle de vie, et état d'incantation.
