/*
** EPITECH PROJECT, 2026
** ResourceManager.cpp
** File description:
** Resource manager implementation
*/#include "../../include/game/ResourceManager.hpp"
#include "../../include/common/Constants.hpp"
#include <cstdlib>
#include <cmath>

ResourceManager::ResourceManager(IMap &map) : _map(map) {}

void ResourceManager::initialize()
{
    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++) {
        auto type = static_cast<ResourceType>(i);
        int total = calculateTotal(type);
        for (int j = 0; j < total; j++)
            addToRandomTile(type, 1);
    }
    _timer = 0;
}

void ResourceManager::spawn()
{
    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++) {
        auto type = static_cast<ResourceType>(i);
        int total = calculateTotal(type);
        int currentTotal = 0;
        auto tiles = _map.getAllTiles();
        for (auto &tileRef : tiles) {
            auto &tile = tileRef.get();
            currentTotal += tile.getResources()[type];
        }
        int toAdd = std::max(0, total - currentTotal);
        for (int j = 0; j < toAdd; j++)
            addToRandomTile(type, 1);
    }
}

int ResourceManager::getTimeUntilNextSpawn() const
{
    return static_cast<int>(Constants::SPAWN_INTERVAL - _timer);
}

int ResourceManager::calculateTotal(ResourceType type) const
{
    return static_cast<int>(std::round(
        _map.getWidth() * _map.getHeight() * Constants::RESOURCE_DENSITY[static_cast<int>(type)]));
}

void ResourceManager::addToRandomTile(ResourceType type, int count)
{
    int x = std::rand() % _map.getWidth();
    int y = std::rand() % _map.getHeight();
    _map.getTile(x, y).getResources()[type] += count;
    if (_onSpawn)
        _onSpawn(x, y);
}
