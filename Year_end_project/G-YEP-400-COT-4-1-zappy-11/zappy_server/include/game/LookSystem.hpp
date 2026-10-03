/*
** EPITECH PROJECT, 2026
** LookSystem.hpp
** File description:
** Look system header
*/#ifndef LOOKSYSTEM_HPP_
#define LOOKSYSTEM_HPP_

#include "Player.hpp"
#include "../interfaces/IMap.hpp"
#include <string>
#include <vector>

class LookSystem {
    public:
        static std::string look(Player &player, IMap &map);
        static std::vector<Position> getVisibleTiles(Player &player, IMap &map);
};

#endif
