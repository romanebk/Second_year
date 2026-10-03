/*
** EPITECH PROJECT, 2026
** ResourceManager.hpp
** File description:
** Resource manager header
*/#ifndef RESOURCEMANAGER_HPP_
#define RESOURCEMANAGER_HPP_

#include "../interfaces/IMap.hpp"
#include <functional>

class ResourceManager {
    public:
        using SpawnCallback = std::function<void(int x, int y)>;

        ResourceManager(IMap &map);

        void initialize();
        void spawn();
        int getTimeUntilNextSpawn() const;

        void setOnSpawn(SpawnCallback cb) { _onSpawn = cb; }

    private:
        IMap &_map;
        double _timer = 0;
        SpawnCallback _onSpawn;

        int calculateTotal(ResourceType type) const;
        void addToRandomTile(ResourceType type, int count);
};

#endif
