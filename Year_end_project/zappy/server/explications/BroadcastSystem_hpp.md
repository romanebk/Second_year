# `include/game/BroadcastSystem.hpp` — Header du système de broadcast

Calcule la direction relative d'un message broadcast.

---

```cpp
class BroadcastSystem {
    public:
        static int computeDirection(const Position &from, const Position &to, Orientation receiverOrientation, IMap &map);
};
```
**Lignes 8-11** — Une seule méthode statique : prend la position de l'émetteur, du récepteur, l'orientation du récepteur, et la carte. Retourne un entier 1-8 pour la direction.
