#ifndef BROADCASTSYSTEM_HPP_
#define BROADCASTSYSTEM_HPP_

#include "Player.hpp"
#include "Map.hpp"
#include <string>

class BroadcastSystem {
    public:
        static int computeDirection(const Position &from, const Position &to, Orientation receiverOrientation, Map &map);
        static void broadcast(Map &map, Player &sender, const std::string &msg, const std::vector<Player *> &allPlayers);
};

#endif
