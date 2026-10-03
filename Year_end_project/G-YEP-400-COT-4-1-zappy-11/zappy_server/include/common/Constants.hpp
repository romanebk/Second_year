/*
** EPITECH PROJECT, 2026
** Constants.hpp
** File description:
** Game constants
*/#ifndef CONSTANTS_HPP_
#define CONSTANTS_HPP_

#include "Structs.hpp"
#include <array>

namespace Constants {
    const int DEFAULT_PORT = 4242;
    const int DEFAULT_FREQ = 100;
    const int MAX_CLIENTS_PER_TEAM = 10;
    const int MAX_PENDING = 10;
    const int MAX_COMMANDS_QUEUED = 10;
    const int FOOD_UNITS = 126;
    const int INITIAL_LIFE = 10;
    const int SPAWN_INTERVAL = 20;
    const int WIN_LEVEL = 8;
    const int WIN_PLAYERS = 6;
    const int EGG_HATCH_TIME = 600;

    const double RESOURCE_DENSITY[] = {
        0.5,   
        0.3,   
        0.15,  
        0.1,   
        0.1,   
        0.08,  
        0.05   
    };

    const int ACTION_TIME[] = {
        7,   
        7,   
        7,   
        7,   
        1,   
        7,   
        0,   
        42,  
        7,   
        7,   
        7,   
        300, 
        0    
    };

    const std::array<ElevationRequirement, 7> ELEVATION = {{
        {1,  {0, 1, 0, 0, 0, 0, 0}},  
        {2,  {0, 1, 1, 1, 0, 0, 0}},  
        {2,  {0, 2, 0, 1, 0, 2, 0}},  
        {4,  {0, 1, 1, 2, 0, 1, 0}},  
        {4,  {0, 1, 2, 1, 3, 0, 0}},  
        {6,  {0, 1, 2, 3, 0, 1, 0}},  
        {6,  {0, 2, 2, 2, 2, 2, 1}}   
    }};

    const char * const WELCOME_MSG = "WELCOME\n";
    const char * const KO_MSG = "ko\n";
    const char * const DEAD_MSG = "dead\n";
};

#endif
