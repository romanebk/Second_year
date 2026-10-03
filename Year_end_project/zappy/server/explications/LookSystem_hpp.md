# `include/game/LookSystem.hpp` — Header du système de vision

Calcule le cône de vision d'un joueur et formate le résultat.

---

```cpp
class LookSystem {
    public:
        static std::string look(Player &player, IMap &map);
        static std::vector<Position> getVisibleTiles(Player &player, IMap &map);
};
```
**Lignes 9-13** — Deux méthodes statiques : `look()` retourne la chaîne formatée, `getVisibleTiles()` retourne la liste des positions visibles.
