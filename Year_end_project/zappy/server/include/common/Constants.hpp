#ifndef CONSTANTS_HPP_
#define CONSTANTS_HPP_

#include "Structs.hpp"
#include <array>

namespace Constants {
    inline constexpr int DEFAULT_PORT = 4242;
    inline constexpr int DEFAULT_FREQ = 100;
    inline constexpr int MAX_CLIENTS_PER_TEAM = 10;
    inline constexpr int MAX_PENDING = 10;
    inline constexpr int MAX_COMMANDS_QUEUED = 10;
    inline constexpr int FOOD_UNITS = 126;
    inline constexpr int INITIAL_LIFE = 10;
    inline constexpr int SPAWN_INTERVAL = 20;
    inline constexpr int WIN_LEVEL = 8;
    inline constexpr int WIN_PLAYERS = 6;

    inline constexpr double RESOURCE_DENSITY[] = {
        0.5,   // FOOD
        0.3,   // LINEMATE
        0.15,  // DERAUMERE
        0.1,   // SIBUR
        0.1,   // MENDIANE
        0.08,  // PHIRAS
        0.05   // THYSTAME
    };

    inline constexpr int ACTION_TIME[] = {
        7,   // FORWARD
        7,   // RIGHT
        7,   // LEFT
        7,   // LOOK
        1,   // INVENTORY
        7,   // BROADCAST
        0,   // CONNECT_NBR (instant)
        42,  // FORK
        7,   // EJECT
        7,   // TAKE
        7,   // SET
        300, // INCANTATION
        0    // NONE
    };

    inline constexpr std::array<ElevationRequirement, 7> ELEVATION = {{
        {1,  {1, 0, 0, 0, 0, 0, 0}},  // 1->2
        {2,  {1, 1, 1, 0, 0, 0, 0}},  // 2->3
        {2,  {2, 0, 1, 0, 2, 0, 0}},  // 3->4
        {4,  {1, 1, 2, 0, 1, 0, 0}},  // 4->5
        {4,  {1, 2, 1, 3, 0, 0, 0}},  // 5->6
        {6,  {1, 2, 3, 0, 1, 0, 0}},  // 6->7
        {6,  {2, 2, 2, 2, 2, 2, 1}}   // 7->8
    }};

    inline constexpr const char *WELCOME_MSG = "WELCOME\n";
    inline constexpr const char *KO_MSG = "ko\n";
    inline constexpr const char *DEAD_MSG = "dead\n";
};

#endif
