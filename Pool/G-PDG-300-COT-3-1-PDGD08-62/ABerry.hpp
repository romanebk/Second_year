/*
** EPITECH PROJECT, 2026
** pool
** File description:
** ABerry.hpp
*/

#ifndef ABERRY_HPP
#define ABERRY_HPP

#include "AFruit.hpp"

class ABerry : public AFruit {
    public:
        ABerry(std::string const &name, unsigned int vitamins);
        virtual ~ABerry();
};

#endif
