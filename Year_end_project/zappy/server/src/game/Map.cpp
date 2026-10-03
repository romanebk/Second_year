#include "../../include/game/Map.hpp"

Map::Map(int width, int height)
    : _width(width), _height(height), _grid(height, std::vector<Tile>(width))
{
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            _grid[y][x].setPosition(x, y);
        }
    }
}

Tile &Map::getTile(int x, int y)
{
    Position p = wrap(x, y);
    return _grid[p.y][p.x];
}

const Tile &Map::getTile(int x, int y) const
{
    Position p = wrap(x, y);
    return _grid[p.y][p.x];
}

Tile &Map::getTile(const Position &pos)
{
    Position p = wrap(pos);
    return _grid[p.y][p.x];
}

Position Map::wrap(int x, int y) const
{
    return {((x % _width) + _width) % _width,
            ((y % _height) + _height) % _height};
}

Position Map::wrap(const Position &pos) const
{
    return wrap(pos.x, pos.y);
}

std::vector<std::reference_wrapper<Tile>> Map::getAllTiles()
{
    std::vector<std::reference_wrapper<Tile>> tiles;
    for (auto &row : _grid) {
        for (auto &tile : row)
            tiles.push_back(std::ref(tile));
    }
    return tiles;
}

std::vector<std::reference_wrapper<const Tile>> Map::getAllTiles() const
{
    std::vector<std::reference_wrapper<const Tile>> tiles;
    for (const auto &row : _grid) {
        for (const auto &tile : row)
            tiles.push_back(std::ref(tile));
    }
    return tiles;
}


