# `src/game/BroadcastSystem.cpp` — Implémentation du broadcast

54 lignes.

---

```cpp
int BroadcastSystem::computeDirection(const Position &from, const Position &to,
                                        Orientation receiverOrientation, IMap &map)
{
    if (from == to)
        return 0;

    int dx = to.x - from.x;
    int dy = to.y - from.y;

    int wrapDx = map.getWidth() - std::abs(dx);
    if (std::abs(wrapDx) < std::abs(dx))
        dx = (dx > 0) ? -wrapDx : wrapDx;

    int wrapDy = map.getHeight() - std::abs(dy);
    if (std::abs(wrapDy) < std::abs(dy))
        dy = (dy > 0) ? -wrapDy : wrapDy;

    double angle = std::atan2(dy, dx);

    int dir = 0;
    switch (receiverOrientation) {
        case Orientation::NORTH:
            if (angle > -M_PI / 4 && angle <= M_PI / 4) dir = 1;
            else if (angle > M_PI / 4 && angle <= 3 * M_PI / 4) dir = 2;
            else if (angle > -3 * M_PI / 4 && angle <= -M_PI / 4) dir = 4;
            else dir = 3;
            break;
        case Orientation::EAST:
            if (angle > -M_PI / 4 && angle <= M_PI / 4) dir = 3;
            else if (angle > M_PI / 4 && angle <= 3 * M_PI / 4) dir = 4;
            else if (angle > -3 * M_PI / 4 && angle <= -M_PI / 4) dir = 2;
            else dir = 1;
            break;
        case Orientation::SOUTH:
            if (angle > -M_PI / 4 && angle <= M_PI / 4) dir = 5;
            else if (angle > M_PI / 4 && angle <= 3 * M_PI / 4) dir = 6;
            else if (angle > -3 * M_PI / 4 && angle <= -M_PI / 4) dir = 8;
            else dir = 7;
            break;
        case Orientation::WEST:
            if (angle > -M_PI / 4 && angle <= M_PI / 4) dir = 7;
            else if (angle > M_PI / 4 && angle <= 3 * M_PI / 4) dir = 8;
            else if (angle > -3 * M_PI / 4 && angle <= -M_PI / 4) dir = 6;
            else dir = 5;
            break;
    }

    return dir;
}
```
**Lignes 4-52** — Calcule la direction d'un broadcast :
1. Si l'émetteur et le récepteur sont sur la même case, retourne 0.
2. Calcule `dx`/`dy` avec wrapping torique (prend le chemin le plus court).
3. Utilise `atan2(dy, dx)` pour obtenir l'angle en radians.
4. Selon l'orientation du récepteur, translate l'angle en direction 1-8 :
   - 1 = devant, 2 = devant-droite, 3 = droite, 4 = derrière-droite,
   - 5 = derrière, 6 = derrière-gauche, 7 = gauche, 8 = devant-gauche.
5. Le switch tourne les quadrants selon l'orientation du récepteur (NORTH = référence, EAST = rotation 90°, etc.).
