#ifndef LOOKSYSTEM_HPP_
#define LOOKSYSTEM_HPP_

#include "Player.hpp"
#include "Map.hpp"
#include <string>
#include <vector>

class LookSystem {
    public:
        static std::string look(Player &player, Map &map);
        static std::vector<Position> getVisibleTiles(Player &player, Map &map);
};

#endif
