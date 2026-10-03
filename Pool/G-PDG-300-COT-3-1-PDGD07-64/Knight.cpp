/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Knight.cpp
*/

#include "Knight.hpp"
#include <iostream>

Knight::Knight(const std::string &name, int power) : Peasant(name, power)
{
    std::cout << Knight::getName() << " vows to protect the kingdom." << std::endl;
}

Knight::~Knight()
{
    std::cout << Knight::getName() << " takes off his armor." << std::endl;
}

int Knight::attack()
{
    if (Knight::getHp() == 0) {
        std::cout << Knight::getName() << " is out of combat." << std::endl;
        return 0;
    }
    if (Knight::getPower() < 10) {
        std::cout << Knight::getName() << " is out of power." << std::endl;
        return 0;
    }
    Knight::setPower(getPower() - 10);
    std::cout << Knight::getName() << " strikes with his sword." << std::endl;
    return 20;
}

int Knight::special()
{
    if (Knight::getHp() == 0) {
        std::cout << Knight::getName() << " is out of combat." << std::endl;
        return 0;
    }
    if (Knight::getPower() < 30) {
        std::cout << Knight::getName() << " is out of power." << std::endl;
        return 0;
    }
    Knight::setPower(getPower() - 30);
    std::cout << Knight::getName() << " impales his enemy." << std::endl;
    return 50;
}

void Knight::rest()
{
    if (Knight::getHp() == 0) {
        std::cout << Knight::getName() << " is out of combat." << std::endl;
        return;
    }
    std::cout << Knight::getName() << " eats." << std::endl;
    Knight::setPower(getPower() + 50);
}

