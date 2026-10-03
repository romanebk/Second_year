/*
** EPITECH PROJECT, 2026
** Player.cpp
** File description:
** Player implementation
*/#include "../../include/game/Player.hpp"
#include "../../include/game/Tile.hpp"
#include "../../include/common/Constants.hpp"

Player::Player(int id, const std::string &teamName)
    : _id(id), _teamName(teamName), _orientation(Orientation::NORTH) {}

void Player::consumeFood()
{
    if (_inventory[ResourceType::FOOD] > 0)
        _inventory[ResourceType::FOOD]--;
}
