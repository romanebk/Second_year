/*
** EPITECH PROJECT, 2026
** Map.hpp
** File description:
** Map class definition
*/#ifndef MAP_HPP_
#define MAP_HPP_

#include "Tile.hpp"
#include "../interfaces/IMap.hpp"
#include "../common/Structs.hpp"
#include <vector>
#include <memory>

class Map : public IMap {
    public:
        Map(int width, int height);

        int getWidth() const override { return _width; }
        int getHeight() const override { return _height; }

        Tile &getTile(int x, int y) override;
        const Tile &getTile(int x, int y) const override;
        Tile &getTile(const Position &pos) override;

        Position wrap(int x, int y) const override;
        Position wrap(const Position &pos) const override;

        std::vector<std::reference_wrapper<Tile>> getAllTiles() override;
        std::vector<std::reference_wrapper<const Tile>> getAllTiles() const override;

    private:
        int _width;
        int _height;
        std::vector<std::vector<Tile>> _grid;
};

#endif
