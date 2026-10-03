#ifndef PLAYER_HPP_
#define PLAYER_HPP_

#include "../common/Structs.hpp"
#include "../common/Enums.hpp"
#include <string>

class Tile;

class Player {
    public:
        Player(int id, const std::string &teamName);

        int getId() const { return _id; }
        const std::string &getTeamName() const { return _teamName; }

        int getLevel() const { return _level; }
        void setLevel(int level) { _level = level; }

        Orientation getOrientation() const { return _orientation; }
        void setOrientation(Orientation orient) { _orientation = orient; }

        const Position &getPosition() const { return _pos; }
        void setPosition(const Position &pos) { _pos = pos; }

        Tile *getTile() const { return _tile; }
        void setTile(Tile *tile) { _tile = tile; }

        Inventory &getInventory() { return _inventory; }
        const Inventory &getInventory() const { return _inventory; }

        int getLife() const { return _life; }
        void setLife(int life) { _life = life; }
        void consumeFood();
        bool isDead() const { return _life <= 0; }

        bool isIncanting() const { return _incanting; }
        void setIncanting(bool v) { _incanting = v; }

    private:
        int _id;
        std::string _teamName;
        int _level = 1;
        Orientation _orientation;
        Position _pos;
        Tile *_tile = nullptr;
        Inventory _inventory;
        int _life = 10;
        bool _incanting = false;
};

#endif
