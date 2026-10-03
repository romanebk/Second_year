/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Priest.hpp
*/

#include "Peasant.hpp"
#include "Priest.hpp"
#include "Enchanter.hpp"
#include <iostream>

Priest::Priest(const std::string &name, int power) : Enchanter(name, power), Peasant(name, power)
{
    std::cout << Enchanter::getName() << " enters in the order." << std::endl;
}

Priest::~Priest()
{
    std::cout << Enchanter::getName() << " finds peace." << std::endl;
}

void Priest::rest()
{
    if (Enchanter::getHp() == 0) {
        std::cout << Enchanter::getName() << " is out of combat." << std::endl;
        return;
    }
    std::cout << Enchanter::getName() << " prays." << std::endl;
    Enchanter::setPower(Enchanter::getPower() + 100);
    Enchanter::setHp(Enchanter::getHp() + 100);
    Enchanter::limit_Values();
}