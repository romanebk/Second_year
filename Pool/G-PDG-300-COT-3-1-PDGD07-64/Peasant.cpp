/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Peasant.cpp
*/

#include "Peasant.hpp"

Peasant::Peasant(const std::string &name, int power) : _name(name), _power(power), _hp(100)
{
    limit_Values();
    std::cout << _name << " goes for an adventure." << std::endl;
}

Peasant::~Peasant()
{
    std::cout << _name << " is back to his crops." << std::endl;
}

void Peasant::limit_Values()
{
    if (_hp < 0)
        _hp = 0;
    if (_hp > 100)
        _hp = 100;
    if (_power < 0)
        _power = 0;
    if (_power > 100)
        _power = 100;
}

void Peasant::setHp(int hp)
{
    _hp = hp;
    limit_Values();
}

void Peasant::setPower(int power)
{
    _power = power;
    limit_Values();
}

const std::string &Peasant::getName() const
{
    return _name;
}

int Peasant::getHp() const
{
    return _hp;
}

int Peasant::getPower() const
{
    return _power;
}

int Peasant::attack()
{
    if (_hp == 0) {
        std::cout << _name << " is out of combat." << std::endl;
        return 0;
    }
    if (_power < 10) {
        std::cout << _name << " is out of power." << std::endl;
        return 0;
    }
    _power -= 10;
    std::cout << _name << " tosses a stone." << std::endl;
    return 5;
}

int Peasant::special()
{
    if (_hp == 0) {
        std::cout << _name << " is out of combat." << std::endl;
        return 0;
    }
    std::cout << _name << " doesn't know any special move." << std::endl;
    return 0;
}

void Peasant::rest()
{
    if (_hp == 0) {
        std::cout << _name << " is out of combat." << std::endl;
        return;
    }
    _power += 30;
    std::cout << _name << " takes a nap." << std::endl;
    limit_Values();
}

void Peasant::damage(int damage)
{
    if (_hp == 0) {
        std::cout << _name << " is out of combat." << std::endl;
        return;
    }
    if (_hp > damage) {
        _hp -= damage;
        std::cout << _name << " takes " << damage << " damage." << std::endl;
        limit_Values();
    } else if (_hp <= damage) {
        std::cout << _name << " is out of combat." << std::endl;
        _hp = 0;
        return;
    }
}
