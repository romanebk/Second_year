/*
** EPITECH PROJECT, 2026
** pool
** File description:
** AFruit.cpp
*/

#include "AFruit.hpp"

AFruit::AFruit(std::string const &name, unsigned int vitamins) : _name(name), _vitamins(vitamins), _peeled(false) {}

AFruit::~AFruit() {}

unsigned int AFruit::getVitamins() const 
{
    if (_peeled)
        return _vitamins;
    return 0;
}

std::string AFruit::getName() const
{
    return _name;
}

bool AFruit::isPeeled() const
{
    return _peeled;
}

void AFruit::peel()
{
    _peeled = true;
}




