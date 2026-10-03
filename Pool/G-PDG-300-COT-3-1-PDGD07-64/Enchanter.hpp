/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Enchanter.hpp
*/

#ifndef ENCHANTER_HPP
#define ENCHANTER_HPP

#include "Peasant.hpp"
#include "ICharacter.hpp"
#include <iostream>

class Enchanter : virtual public Peasant, virtual public ICharacter {
public:
    Enchanter(const std::string &name, int power);
    ~Enchanter();
    int attack();
    int special();
    void rest();
};

#endif
