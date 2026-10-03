/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Human.cpp
*/

#include "Human.hpp"

std::string Mondas::Human::getName() const
{
    return this->_name;
}

unsigned int Mondas::Human::getIq() const
{
    return this->_iq;
}

Mondas::Human::Human(std::string name, unsigned int iq)
{
    this->_name = name;
    this->_iq = iq;
    this->inhibitor = nullptr;
    std::cout << this->_name << ": I must save Mondas with my IQ of " << this->_iq << "." << std::endl;
}

Mondas::Human::Human(std::string name)
{
    this->_name = name;
    this->_iq = 192;
    this->inhibitor = nullptr;
    std::cout << this->_name << ": I must save Mondas with my IQ of " << this->_iq << "." << std::endl;
}

Mondas::Human::Human(std::string name, unsigned int iq, Cyberman::Inhibitor *inhibitor)
{
    this->_name = name;
    this->_iq = iq;
    this->inhibitor = inhibitor;
    std::cout << this->_name << ": I must save Mondas with my IQ of " << this->_iq << "." << std::endl;
}

Mondas::Human::Human(std::string name, Cyberman::Inhibitor *inhibitor)
{
    this->_name = name;
    this->_iq = 192;
    this->inhibitor = inhibitor;
    std::cout << this->_name << ": I must save Mondas with my IQ of " << this->_iq << "." << std::endl;
}

Mondas::Human::~Human()
{
    std::cout << this->_name << ": I failed to save my world..." << std::endl;
}

void Mondas::Human::setIq(unsigned int new_iq)
{
    if (new_iq > this->_iq) {
        this->_iq = new_iq;
        std::cout << this->_name << ": My IQ is now " << this->_iq << "." << std::endl;
    }
}

void Mondas::Human::think() const
{
    std::cout << this->_name << ": Think, think, think..." << std::endl;
}

Mondas::Cyberman::Inhibitor* Mondas::Human::getInihibitor()
{
    return this->inhibitor;
}

const Mondas::Cyberman::Inhibitor* Mondas::Human::getInihibitor() const
{
    return this->inhibitor;
}

void Mondas::Human::setInhibitor(Mondas::Cyberman::Inhibitor *inhibitor)
{
    if (this->inhibitor == nullptr) 
        this->inhibitor = inhibitor;
}
