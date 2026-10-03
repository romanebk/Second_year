/*
** EPITECH PROJECT, 2026
** LookSystem.cpp
** File description:
** Look system implementation
*/#include "../../include/game/LookSystem.hpp"
#include "../../include/game/CommandUtils.hpp"
#include <sstream>

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

        for (int r = 0; r < static_cast<int>(ResourceType::COUNT); r++) {
            auto type = static_cast<ResourceType>(r);
            int count = tile.getResources()[type];
            for (int c = 0; c < count; c++) {
                if (!first) oss << " ";
                oss << resourceName(type);
                first = false;
            }
        }

        if (i < tiles.size() - 1)
            oss << ",";
    }
    oss << "]\n";
    return oss.str();
}

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
