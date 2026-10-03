# `src/game/LookSystem.cpp` — Implémentation du système de vision

79 lignes, 2 fonctions.

---

```cpp
std::string LookSystem::look(Player &player, IMap &map)
{
    auto tiles = getVisibleTiles(player, map);
    std::ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < tiles.size(); i++) {
        auto &tile = map.getTile(tiles[i]);
        bool first = true;

        for (size_t pi = 0; pi < tile.getPlayers().size(); pi++) {
            if (!first) oss << " ";
            oss << "player";
            first = false;
        }

        const char *resNames[] = {"food", "linemate", "deraumere", "sibur", "mendiane", "phiras", "thystame"};
        for (int r = 0; r < static_cast<int>(ResourceType::COUNT); r++) {
            auto type = static_cast<ResourceType>(r);
            int count = tile.getResources()[type];
            for (int c = 0; c < count; c++) {
                if (!first) oss << " ";
                oss << resNames[r];
                first = false;
            }
        }

        if (i < tiles.size() - 1)
            oss << ",";
    }
    oss << "]\n";
    return oss.str();
}
```
**Lignes 4-35** — `look()` formate la vision :
1. Récupère les tuiles visibles.
2. Pour chaque tuile : liste les joueurs ("player") puis les ressources (nom répété pour chaque unité).
3. Séparateur `,` entre tuiles.
4. Format : `[player,player food linemate,player,...]\n`

```cpp
std::vector<Position> LookSystem::getVisibleTiles(Player &player, IMap &map)
{
    std::vector<Position> tiles;
    int level = player.getLevel();
    Position pos = player.getPosition();
    Orientation orient = player.getOrientation();

    tiles.push_back(pos);

    for (int l = 1; l <= level; l++) {
        Position start = pos;
        int leftDx = 0, leftDy = 0;

        switch (orient) {
            case Orientation::NORTH:
                start.y = pos.y - l;
                leftDx = -1;
                break;
            case Orientation::EAST:
                start.x = pos.x + l;
                leftDy = -1;
                break;
            case Orientation::SOUTH:
                start.y = pos.y + l;
                leftDx = 1;
                break;
            case Orientation::WEST:
                start.x = pos.x - l;
                leftDy = 1;
                break;
        }

        for (int w = l; w >= -l; w--) {
            Position tilePos = start;
            tilePos.x += w * (leftDx ? leftDx : 0);
            tilePos.y += w * (leftDy ? leftDy : 0);
            tilePos = map.wrap(tilePos);
            tiles.push_back(tilePos);
        }
    }

    return tiles;
}
```
**Lignes 37-79** — `getVisibleTiles()` calcule le cône de vision :
1. La tuile du joueur est toujours visible (index 0).
2. Pour chaque niveau 1..level : calcule la position de départ devant le joueur, puis scanne de +l à -l perpendiculairement (ordre **gauche → droite**).
3. `leftDx`/`leftDy` donne la direction perpendiculaire (gauche du regard).
4. Le wrapping torique est appliqué à chaque position.
