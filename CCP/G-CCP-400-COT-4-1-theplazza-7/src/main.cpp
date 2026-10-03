/*
** EPITECH PROJECT, 2026
** main
** File description:
** main
*/

#include "Reception.hpp"

#include <cstdlib>
#include <iostream>
#include <string>

namespace {

bool parseCookingMultiplier(const char *text, double &multiplier)
{
    try {
        std::size_t consumed = 0;
        multiplier = std::stod(text, &consumed);
        return consumed == std::string(text).size() && multiplier >= 0.0;
    } catch (...) {
        return false;
    }
}

bool parsePositiveInteger(const char *text, int &value)
{
    try {
        std::size_t consumed = 0;
        const long parsed = std::stol(text, &consumed);
        if (consumed != std::string(text).size() || parsed <= 0)
            return false;
        value = static_cast<int>(parsed);
        return true;
    } catch (...) {
        return false;
    }
}

void printUsage(const char *programName)
{
    std::cerr << "Usage: " << programName
              << " <cooking_multiplier> <cooks_per_kitchen> <regen_ms>"
              << std::endl;
}

bool parseCommandLine(int argc, char **argv, Reception::Settings &settings)
{
    if (argc != 4) {
        printUsage(argv[0]);
        return false;
    }

    int cooksPerKitchen = 0;
    int regenMs = 0;

    if (!parseCookingMultiplier(argv[1], settings.cookingMultiplier) ||
        !parsePositiveInteger(argv[2], cooksPerKitchen) ||
        !parsePositiveInteger(argv[3], regenMs)) {
        std::cerr << "Invalid arguments" << std::endl;
        return false;
    }

    settings.cooksPerKitchen = static_cast<std::size_t>(cooksPerKitchen);
    settings.regenIntervalMs = regenMs;
    return true;
}

} // namespace

int main(int argc, char **argv)
{
    Reception::Settings settings{};
    if (!parseCommandLine(argc, argv, settings))
        return 84;

    Reception reception(settings);
    return reception.run();
}
