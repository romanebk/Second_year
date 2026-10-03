#ifndef MAP_HPP_
#define MAP_HPP_

#include "Tile.hpp"
#include "../common/Structs.hpp"
#include <vector>
#include <memory>

class Map {
    public:
        Map(int width, int height);

        int getWidth() const { return _width; }
        int getHeight() const { return _height; }

        Tile &getTile(int x, int y);
        const Tile &getTile(int x, int y) const;
        Tile &getTile(const Position &pos);

        Position wrap(int x, int y) const;
        Position wrap(const Position &pos) const;

        std::vector<std::reference_wrapper<Tile>> getAllTiles();
        std::vector<std::reference_wrapper<const Tile>> getAllTiles() const;

    private:
        int _width;
        int _height;
        std::vector<std::vector<Tile>> _grid;
};

#endif
