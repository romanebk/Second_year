/*
** EPITECH PROJECT, 2026
** Structs.hpp
** File description:
** Common structs
*/#ifndef STRUCTS_HPP_
#define STRUCTS_HPP_

#include "Enums.hpp"
#include <string>
#include <array>

struct Position {
    int x = 0;
    int y = 0;

    bool operator==(const Position &other) const {
        return x == other.x && y == other.y;
    }
};

struct Inventory {
    std::array<int, static_cast<int>(ResourceType::COUNT)> resources = {0};

    int &operator[](ResourceType type) {
        return resources.at(static_cast<int>(type));
    }

    const int &operator[](ResourceType type) const {
        return resources.at(static_cast<int>(type));
    }
};

struct ElevationRequirement {
    int playersRequired;
    std::array<int, static_cast<int>(ResourceType::COUNT)> resources;
};

#endif
