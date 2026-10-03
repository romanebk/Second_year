#include "../../include/game/Tile.hpp"
#include <algorithm>

void Tile::addPlayer(Player *player)
{
    if (player && std::find(_players.begin(), _players.end(), player) == _players.end()) {
        _players.push_back(player);
        player->setTile(this);
    }
}

void Tile::removePlayer(Player *player)
{
    auto it = std::find(_players.begin(), _players.end(), player);
    if (it != _players.end()) {
        _players.erase(it);
        player->setTile(nullptr);
    }
}

void Tile::addEgg(Egg *egg)
{
    if (egg && std::find(_eggs.begin(), _eggs.end(), egg) == _eggs.end())
        _eggs.push_back(egg);
}

void Tile::removeEgg(Egg *egg)
{
    auto it = std::find(_eggs.begin(), _eggs.end(), egg);
    if (it != _eggs.end())
        _eggs.erase(it);
}
