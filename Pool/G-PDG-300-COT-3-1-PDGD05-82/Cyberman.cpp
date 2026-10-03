/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Cyberman.cpp
*/

#include "Cyberman.hpp"
#include <iostream>
#include "Human.hpp"
#include "Cyberman.hpp"

std::string Mondas::Cyberman::convertToLeet(const std::string& name) const
{
    std::string leetName = name;
    for (size_t i = 0; i < leetName.length(); i++) {
        if (leetName[i] == 'a' || leetName[i] == 'A')
            leetName[i] = '4';
        else if (leetName[i] == 'b' || leetName[i] == 'B')
            leetName[i] = '8';
        else if (leetName[i] == 'e' || leetName[i] == 'E')
            leetName[i] = '3';
        else if (leetName[i] == 'g' || leetName[i] == 'G')
            leetName[i] = '6';
        else if (leetName[i] == 'i' || leetName[i] == 'I' || leetName[i] == 'l' || leetName[i] == 'L')
            leetName[i] = '1';
        else if (leetName[i] == 'o' || leetName[i] == 'O')
            leetName[i] = '0';
        else if (leetName[i] == 'r' || leetName[i] == 'R')
            leetName[i] = '2';
        else if (leetName[i] == 's' || leetName[i] == 'S')
            leetName[i] = '5';
        else if (leetName[i] == 't' || leetName[i] == 'T' || leetName[i] == 'y' || leetName[i] == 'Y')
            leetName[i] = '7';
        else if (leetName[i] == ' ')
            leetName[i] = '_';
    }
    return leetName;
}

Mondas::Cyberman::Cyberman(Human& human) : _human(human)
{
    std::cout << convertToLeet(human.getName()) << ": Unit activated." << std::endl;
}

Mondas::Cyberman::~Cyberman()
{
    std::cout << convertToLeet(this->_human.getName()) << ": Unit deactivated." << std::endl;
}

Mondas::Human& Mondas::Cyberman::getHuman()
{
    return this->_human;
}

const Mondas::Human& Mondas::Cyberman::getHuman() const
{
    return this->_human;
}

Mondas::Cyberman::Inhibitor::Inhibitor()
{
    this->_state = false;
}

Mondas::Cyberman::Inhibitor::~Inhibitor()
{
    this->_state = true;
}

bool Mondas::Cyberman::Inhibitor::get() const
{
    return this->_state;
}

void Mondas::Cyberman::Inhibitor::set(bool state)
{
    this->_state = state;
}


void Mondas::Cyberman::think() const
{
    const Inhibitor* inhibitor = this->_human.getInihibitor();
    if (inhibitor != nullptr && inhibitor->get()) {
        std::cout << convertToLeet(this->_human.getName()) << ": Computation in progress." << std::endl;
    } else {
        std::cout << convertToLeet(this->_human.getName()) << ": Pain, pain, pain..." << std::endl;
    }
}

unsigned int Mondas::Cyberman::getIq() const
{
    const Inhibitor* inhibitor = _human.getInihibitor();
    if (inhibitor != nullptr && inhibitor->get()) {
        return _human.getIq();
    }
    return 0;
}