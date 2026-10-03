/*
** EPITECH PROJECT, 2026
** BroadcastSystem.hpp
** File description:
** Broadcast system header
*/#ifndef BROADCASTSYSTEM_HPP_
#define BROADCASTSYSTEM_HPP_

#include "Player.hpp"
#include "../interfaces/IMap.hpp"
#include <string>

class BroadcastSystem {
    public:
        static int computeDirection(const Position &from, const Position &to, Orientation receiverOrientation, IMap &map);
};

#endif
