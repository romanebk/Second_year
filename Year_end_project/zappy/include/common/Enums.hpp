#ifndef ENUMS_HPP_
#define ENUMS_HPP_

enum class ResourceType {
    FOOD = 0,
    LINEMATE,
    DERAUMERE,
    SIBUR,
    MENDIANE,
    PHIRAS,
    THYSTAME,
    COUNT
};

enum class Orientation {
    NORTH = 1,
    EAST = 2,
    SOUTH = 3,
    WEST = 4
};

enum class ClientState {
    AWAITING_TEAM,
    AWAITING_SLOT,
    PLAYING,
    DEAD
};

enum class ActionType {
    FORWARD,
    RIGHT,
    LEFT,
    LOOK,
    INVENTORY,
    BROADCAST,
    CONNECT_NBR,
    FORK,
    EJECT,
    TAKE,
    SET,
    INCANTATION,
    NONE
};

#endif
