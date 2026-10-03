/*
** EPITECH PROJECT, 2026
** Team.cpp
** File description:
** Team implementation
*/#include "../../include/game/Team.hpp"
#include "../../include/common/Constants.hpp"
#include <algorithm>
#include <cstdlib>

Team::Team(const std::string &name, int maxSlots) : _name(name), _maxSlots(maxSlots) {}

int Team::getFreeSlots() const
{
    int hatchedAlive = 0;
    int unhatchedAlive = 0;
    int consumed = 0;
    for (auto &egg : _eggs) {
        if (egg->isDead())
            continue;
        if (egg->isConsumed())
            consumed++;
        else if (egg->isHatched())
            hatchedAlive++;
        else
            unhatchedAlive++;
    }
    return std::max(0, _maxSlots - static_cast<int>(_players.size()) + hatchedAlive + consumed - unhatchedAlive);
}

void Team::addPlayer(Player *player)
{
    if (player)
        _players.push_back(player);
}

void Team::removePlayer(Player *player)
{
    auto it = std::find(_players.begin(), _players.end(), player);
    if (it != _players.end())
        _players.erase(it);
}

Player *Team::getPlayer(int id) const
{
    for (auto *p : _players) {
        if (p->getId() == id)
            return p;
    }
    return nullptr;
}

void Team::addEgg(Egg *egg)
{
    if (egg)
        _eggs.push_back(egg);
}

void Team::removeEgg(Egg *egg)
{
    auto it = std::find(_eggs.begin(), _eggs.end(), egg);
    if (it != _eggs.end())
        _eggs.erase(it);
}

Egg *Team::getAvailableEgg() const
{
    std::vector<Egg *> available;
    for (auto *egg : _eggs) {
        if (egg->isHatched() && !egg->isDead() && !egg->isConsumed())
            available.push_back(egg);
    }
    if (available.empty())
        return nullptr;
    return available[std::rand() % available.size()];
}

bool Team::hasWon() const
{
    int count = 0;
    for (auto *p : _players) {
        if (p->getLevel() >= Constants::WIN_LEVEL)
            count++;
    }
    return count >= Constants::WIN_PLAYERS;
}
