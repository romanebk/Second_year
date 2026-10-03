/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Paladin.hpp
*/

#ifndef PALADIN_HPP
#define PALADIN_HPP

#include <iostream>
#include "Knight.hpp"
#include "Priest.hpp"
#include "ICharacter.hpp"

class Paladin : virtual public Knight, virtual public Priest, virtual public ICharacter
{
public:
    Paladin(const std::string &name, int power);
    ~Paladin();
    int attack();
    int special();
    void rest();
};

#endif

