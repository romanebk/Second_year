/*
** EPITECH PROJECT, 2026
** pool
** File description:
** IFruit.cpp
*/

#include "IFruit.hpp"

std::ostream& operator<<(std::ostream& os, const IFruit& fruit)
{
    os << "{ \"name\": \"" + fruit.getName() + "\", \"vitamins\": " + std::to_string(fruit.getVitamins()) + ", \"peeled\": " + (fruit.isPeeled() ? "true" : "false") + " }";
    return os;
}