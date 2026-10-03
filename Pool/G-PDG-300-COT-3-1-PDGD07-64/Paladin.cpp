/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Paladin.cpp
*/

#include "Paladin.hpp"
#include <iostream>


Paladin::Paladin(const std::string &name, int power) : Knight(name, power), Priest(name, power), Peasant(name, power)
{
    std::cout << getName() << " fights for the light." << std::endl;
}
Paladin::~Paladin()
{
    std::cout << getName() << " is blessed." << std::endl;
}

int Paladin::attack() 
{
    return Knight::attack();
}

int Paladin::special()
{
    return Enchanter::special();
}

void Paladin::rest()
{
    return Priest::rest();
}
