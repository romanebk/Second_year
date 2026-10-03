/*
** EPITECH PROJECT, 2026
** IPlayer.hpp
** File description:
** Player interface
*/#ifndef IPLAYER_HPP_
#define IPLAYER_HPP_

#include "../common/Structs.hpp"
#include "../common/Enums.hpp"
#include <string>

class Tile;

class IPlayer {
    public:
        virtual ~IPlayer() = default;
        virtual int getId() const = 0;
        virtual const std::string &getTeamName() const = 0;
        virtual int getLevel() const = 0;
        virtual void setLevel(int level) = 0;
        virtual Orientation getOrientation() const = 0;
        virtual void setOrientation(Orientation orient) = 0;
        virtual const Position &getPosition() const = 0;
        virtual void setPosition(const Position &pos) = 0;
        virtual Tile *getTile() const = 0;
        virtual void setTile(Tile *tile) = 0;
        virtual Inventory &getInventory() = 0;
        virtual const Inventory &getInventory() const = 0;
        virtual int getLife() const = 0;
        virtual void consumeFood() = 0;
        virtual bool isDead() const = 0;
        virtual bool isIncanting() const = 0;
        virtual void setIncanting(bool v) = 0;
};

#endif
