# `include/game/Tile.hpp` — Header de la tuile

Définit une case de la carte.

---

```cpp
class Tile {
    public:
        Tile() = default;

        Inventory &getResources() { return _resources; }
        const Inventory &getResources() const { return _resources; }

        void addPlayer(Player *player);
        void removePlayer(Player *player);
        const std::vector<Player *> &getPlayers() const { return _players; }
        int getPlayerCount() const { return _players.size(); }

        void addEgg(Egg *egg);
        void removeEgg(Egg *egg);
        const std::vector<Egg *> &getEggs() const { return _eggs; }

        void setPosition(int x, int y) { _pos = {x, y}; }
        const Position &getPosition() const { return _pos; }

    private:
        Position _pos;
        Inventory _resources;
        std::vector<Player *> _players;
        std::vector<Egg *> _eggs;
};
```
**Lignes 13-37** — Une `Tile` contient :
- Une `Position` (sa coordonnée).
- Un `Inventory` (les ressources présentes sur la case).
- Une liste de `Player*` (joueurs présents).
- Une liste de `Egg*` (œufs présents).

Les méthodes `addPlayer`/`removePlayer` et `addEgg`/`removeEgg` sont définies dans le .cpp car elles ont une logique non-triviale (vérification des doublons, mise à jour du `_tile` du joueur).
