/*
** EPITECH PROJECT, 2026
** CommandUtils.hpp
** File description:
** Command utility helpers
*/#ifndef COMMANDUTILS_HPP_
#define COMMANDUTILS_HPP_

#include "../common/Enums.hpp"
#include <string>

inline ResourceType parseResourceType(const std::string &name)
{
    if (name == "food") return ResourceType::FOOD;
    if (name == "linemate") return ResourceType::LINEMATE;
    if (name == "deraumere") return ResourceType::DERAUMERE;
    if (name == "sibur") return ResourceType::SIBUR;
    if (name == "mendiane") return ResourceType::MENDIANE;
    if (name == "phiras") return ResourceType::PHIRAS;
    if (name == "thystame") return ResourceType::THYSTAME;
    return ResourceType::COUNT;
}

inline const char *resourceName(ResourceType type)
{
    static const char *names[] = {
        "food", "linemate", "deraumere", "sibur", "mendiane", "phiras", "thystame"
    };
    int idx = static_cast<int>(type);
    return (idx >= 0 && idx < static_cast<int>(ResourceType::COUNT)) ? names[idx] : "unknown";
}

#endif
