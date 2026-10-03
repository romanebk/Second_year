/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Knight.hpp
*/

#ifndef KNIGHT_HPP
#define KNIGHT_HPP
#include <iostream>
#include "Peasant.hpp"
#include "ICharacter.hpp"

class Knight : virtual public Peasant, virtual public ICharacter {
public:
    Knight(const std::string &name, int power);
    ~Knight();
    int attack();
    int special();
    void rest();
};

#endif