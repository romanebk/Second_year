# `include/game/Egg.hpp` — Header de l'œuf

Définition de la classe `Egg`.

---

```cpp
class Egg {
    public:
        Egg(int id, const std::string &teamName, const Position &pos);

        int getId() const { return _id; }
        const std::string &getTeamName() const { return _teamName; }
        const Position &getPosition() const { return _pos; }
        bool isHatched() const { return _hatched; }
        bool isDead() const { return _dead; }

        void hatch();
        void kill();

    private:
        int _id;
        std::string _teamName;
        Position _pos;
        bool _hatched = false;
        bool _dead = false;
};
```
**Lignes 8-27** — Classe simple : identifiant, équipe, position, et deux booléens `_hatched`/`_dead`. `hatch()` et `kill()` modifient ces flags. Les getters sont triviaux (inline dans le header).
