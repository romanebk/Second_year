/*
** EPITECH PROJECT, 2026
** pool
** File description:
** ANut.hpp
*/

#ifndef ANUT_HPP
#define ANUT_HPP

#include "AFruit.hpp"

class ANut : public AFruit {
    public:
        ANut(std::string const &name, unsigned int vitamins);
        virtual ~ANut();
};

#endif
