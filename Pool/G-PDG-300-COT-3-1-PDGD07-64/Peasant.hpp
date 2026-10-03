/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Peasant.hpp
*/

#ifndef PEASANT_HPP
#define PEASANT_HPP

#include <iostream>
#include "ICharacter.hpp"

class Peasant : virtual public ICharacter {
    public:
        Peasant(const std::string &name, int power);
        ~Peasant();
        int attack();
        int special();
        void rest();
        void damage(int damage);
        void setHp(int hp);
        void setPower(int power);
        const std::string &getName() const;
        int getHp() const;
        int getPower() const;
        void limit_Values();
    private:
        std::string _name;
        int _hp;
        int _power;
};

#endif