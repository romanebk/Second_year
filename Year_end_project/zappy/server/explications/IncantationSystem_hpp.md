# `include/game/IncantationSystem.hpp` — Header du système d'incantation

Vérifie et exécute les incantations (élévation de niveau).

---

```cpp
class IncantationSystem {
    public:
        static bool checkRequirements(Tile &tile, int targetLevel);
        static bool performIncantation(Tile &tile, int targetLevel,
                                        const std::vector<Player *> &participants);
        static std::vector<Player *> getEligiblePlayers(Tile &tile, int level);
};
```
**Lignes 8-14** — Trois méthodes statiques : `checkRequirements()` vérifie si les conditions sont réunies, `performIncantation()` exécute l'incantation (consomme les ressources et monte les niveaux si réussi), `getEligiblePlayers()` liste les joueurs éligibles sur une tuile.
