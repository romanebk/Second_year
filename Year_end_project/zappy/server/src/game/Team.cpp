#include "../../include/game/Team.hpp"
#include "../../include/common/Constants.hpp"
#include <algorithm>

Team::Team(const std::string &name, int maxSlots)
    : _name(name), _maxSlots(maxSlots) {}

int Team::getFreeSlots() const
{
    int eggSlots = 0;
    for (auto &egg : _eggs) {
        if (!egg->isHatched() && !egg->isDead())
            eggSlots++;
    }
    return _maxSlots - _players.size() + eggSlots;
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
    for (auto *egg : _eggs) {
        if (!egg->isHatched() && !egg->isDead())
            return egg;
    }
    return nullptr;
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
