/*
** EPITECH PROJECT, 2026
** Tile.hpp
** File description:
** Tile class definition
*/#ifndef TILE_HPP_
#define TILE_HPP_

#include "../common/Structs.hpp"
#include "Player.hpp"
#include "Egg.hpp"
#include <vector>
#include <memory>

class Player;
class Egg;

class Tile {
    public:
        Tile() = default;

        Inventory &getResources() { return _resources; }
        const Inventory &getResources() const { return _resources; }

        void addPlayer(Player *player);
        void removePlayer(Player *player);
        const std::vector<Player *> &getPlayers() const { return _players; }
        int getPlayerCount() const { return _players.size(); }

        void addEgg(Egg *egg);
        void removeEgg(Egg *egg);
        const std::vector<Egg *> &getEggs() const { return _eggs; }

        void setPosition(int x, int y) { _pos = {x, y}; }
        const Position &getPosition() const { return _pos; }

    private:
        Position _pos;
        Inventory _resources;
        std::vector<Player *> _players;
        std::vector<Egg *> _eggs;
};

#endif
