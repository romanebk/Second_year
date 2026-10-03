/*
** EPITECH PROJECT, 2026
** IMap.hpp
** File description:
** Map interface
*/#ifndef IMAP_HPP_
#define IMAP_HPP_

#include "../common/Structs.hpp"
#include "../game/Tile.hpp"
#include <vector>
#include <functional>

class IMap {
    public:
        virtual ~IMap() = default;
        virtual int getWidth() const = 0;
        virtual int getHeight() const = 0;
        virtual Tile &getTile(int x, int y) = 0;
        virtual const Tile &getTile(int x, int y) const = 0;
        virtual Tile &getTile(const Position &pos) = 0;
        virtual Position wrap(int x, int y) const = 0;
        virtual Position wrap(const Position &pos) const = 0;
        virtual std::vector<std::reference_wrapper<Tile>> getAllTiles() = 0;
        virtual std::vector<std::reference_wrapper<const Tile>> getAllTiles() const = 0;
};

#endif
