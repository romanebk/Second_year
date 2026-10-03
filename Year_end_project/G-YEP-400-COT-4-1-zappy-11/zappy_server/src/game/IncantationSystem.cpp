/*
** EPITECH PROJECT, 2026
** IncantationSystem.cpp
** File description:
** Incantation system implementation
*/#include "../../include/game/IncantationSystem.hpp"
#include "../../include/common/Constants.hpp"
#include <algorithm>

bool IncantationSystem::checkRequirements(Tile &tile, int targetLevel)
{
    if (targetLevel < 2 || targetLevel > 8)
        return false;

    const auto &req = Constants::ELEVATION[targetLevel - 2];

    int eligibleCount = 0;
    for (auto *p : tile.getPlayers()) {
        if (p && !p->isDead() && p->getLevel() == targetLevel - 1 && !p->isIncanting())
            eligibleCount++;
    }
    if (eligibleCount < req.playersRequired)
        return false;

    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++) {
        if (tile.getResources().resources[i] < req.resources[i])
            return false;
    }

    return true;
}

bool IncantationSystem::performIncantation(Tile &tile, int targetLevel,
                                            const std::vector<Player *> &participants)
{
    if (targetLevel < 2 || targetLevel > 8)
        return false;

    const auto &req = Constants::ELEVATION[targetLevel - 2];

    int eligibleCount = 0;
    for (auto *p : participants) {
        if (p && !p->isDead() && p->getLevel() == targetLevel - 1 && p->getTile() == &tile)
            eligibleCount++;
    }
    if (eligibleCount < req.playersRequired)
        return false;

    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++) {
        if (tile.getResources().resources[i] < req.resources[i])
            return false;
    }

    for (int i = 0; i < static_cast<int>(ResourceType::COUNT); i++)
        tile.getResources().resources[i] -= req.resources[i];

    return true;
}

std::vector<Player *> IncantationSystem::getEligiblePlayers(Tile &tile, int level)
{
    std::vector<Player *> eligible;
    for (auto *p : tile.getPlayers()) {
        if (p && !p->isDead() && p->getLevel() == level && !p->isIncanting())
            eligible.push_back(p);
    }
    return eligible;
}
