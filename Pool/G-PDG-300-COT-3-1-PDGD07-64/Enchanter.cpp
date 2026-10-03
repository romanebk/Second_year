/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Enchanter.cpp
*/

#include "Enchanter.hpp"
#include <iostream>

Enchanter::Enchanter(const std::string &name, int power) : Peasant(name, power)
{
    std::cout << Enchanter::getName() << " learns magic from his spellbook." << std::endl;
}

Enchanter::~Enchanter()
{
    std::cout << Enchanter::getName() << " closes his spellbook." << std::endl;
}

int Enchanter::attack()
{
    if (Enchanter::getHp() == 0) {
        std::cout << Enchanter::getName() << " is out of combat." << std::endl;
        return 0;
    }
    std::cout << Enchanter::getName() << " doesn't know how to fight." << std::endl;
    return 0;
}

int Enchanter::special()
{
    if (Enchanter::getHp() == 0) {
        std::cout << Enchanter::getName() << " is out of combat." << std::endl;
        return 0;
    } else if (Enchanter::getPower() < 50) {
        std::cout << Enchanter::getName() << " is out of power." << std::endl;
        return 0;
    } else {
        Enchanter::setPower(Enchanter::getPower() - 50);
        std::cout << Enchanter::getName() << " casts a fireball." << std::endl;
        return 99;
    }
}

void Enchanter::rest()
{
    if (Enchanter::getHp() == 0) {
        std::cout << Enchanter::getName() << " is out of combat." << std::endl;
        return;
    } else {
        std::cout << Enchanter::getName() << " meditates." << std::endl;
        Enchanter::setPower(Enchanter::getPower() + 100);
        Enchanter::limit_Values();
    }
}