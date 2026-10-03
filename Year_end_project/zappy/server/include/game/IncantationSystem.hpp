#ifndef INCANTATIONSYSTEM_HPP_
#define INCANTATIONSYSTEM_HPP_

#include "Tile.hpp"
#include "../game/Player.hpp"
#include <vector>

class IncantationSystem {
    public:
        static bool checkRequirements(Tile &tile, int targetLevel);
        static bool performIncantation(Tile &tile, int targetLevel);
        static std::vector<Player *> getEligiblePlayers(Tile &tile, int level);
};

#endif
