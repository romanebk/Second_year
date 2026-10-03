/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Priest.hpp
*/

#ifndef PRIEST_HPP
#define PRIEST_HPP

#include "Enchanter.hpp"

class Priest : public Enchanter, virtual public ICharacter {
public:
    Priest(const std::string &name, int power);
    ~Priest();
    void rest();
};

#endif