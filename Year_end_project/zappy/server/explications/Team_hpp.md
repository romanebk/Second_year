# `include/game/Team.hpp` — Header de l'équipe

Gère les joueurs et œufs d'une équipe.

---

```cpp
class Team {
    public:
        Team(const std::string &name, int maxSlots);

        const std::string &getName() const { return _name; }
        int getMaxSlots() const { return _maxSlots; }
        int getFreeSlots() const;
        int getUsedSlots() const { return _players.size(); }

        void addPlayer(Player *player);
        void removePlayer(Player *player);
        Player *getPlayer(int id) const;
        const std::vector<Player *> &getPlayers() const { return _players; }

        void addEgg(Egg *egg);
        void removeEgg(Egg *egg);
        Egg *getAvailableEgg() const;
        const std::vector<Egg *> &getEggs() const { return _eggs; }

        bool hasWon() const;

    private:
        std::string _name;
        int _maxSlots;
        std::vector<Player *> _players;
        std::vector<Egg *> _eggs;
};
```
**Lignes 10-37** — Une `Team` contient un nom, un nombre max de slots, une liste de joueurs et une liste d'œufs. `getFreeSlots()` et `hasWon()` ont une logique non-triviale définie dans le .cpp.
