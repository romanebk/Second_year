/*
** EPITECH PROJECT, 2026
** pool
** File description:
** ICharacter.hpp
*/

#ifndef ICHARACTER_HPP
#define ICHARACTER_HPP

#include <string>

class ICharacter
{
public:
    virtual ~ICharacter() {}
    virtual int attack() = 0;
    virtual int special() = 0;
    virtual void rest() = 0;
    virtual std::string const& getName() const = 0;
    virtual void damage(int damage) = 0;
    virtual int getHp() const = 0;
    virtual int getPower() const = 0;
};

#endif