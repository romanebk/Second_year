/*
** EPITECH PROJECT, 2026
** Player.hpp
** File description:
** Player class definition
*/#ifndef PLAYER_HPP_
#define PLAYER_HPP_

#include "../common/Structs.hpp"
#include "../common/Enums.hpp"
#include "../interfaces/IPlayer.hpp"
#include <string>

class Tile;

class Player : public IPlayer {
    public:
        Player(int id, const std::string &teamName);

        int getId() const override { return _id; }
        const std::string &getTeamName() const override { return _teamName; }

        int getLevel() const override { return _level; }
        void setLevel(int level) override { _level = level; }

        Orientation getOrientation() const override { return _orientation; }
        void setOrientation(Orientation orient) override { _orientation = orient; }

        const Position &getPosition() const override { return _pos; }
        void setPosition(const Position &pos) override { _pos = pos; }

        Tile *getTile() const override { return _tile; }
        void setTile(Tile *tile) override { _tile = tile; }

        Inventory &getInventory() override { return _inventory; }
        const Inventory &getInventory() const override { return _inventory; }

        int getLife() const override { return _inventory[ResourceType::FOOD]; }
        void setLife(int life) { _inventory[ResourceType::FOOD] = life; }
        void consumeFood() override;
        bool isDead() const override { return _inventory[ResourceType::FOOD] <= 0; }

        bool isIncanting() const override { return _incanting; }
        void setIncanting(bool v) override { _incanting = v; }

    private:
        int _id;
        std::string _teamName;
        int _level = 1;
        Orientation _orientation;
        Position _pos;
        Tile *_tile = nullptr;
        Inventory _inventory;
        bool _incanting = false;
};

#endif
