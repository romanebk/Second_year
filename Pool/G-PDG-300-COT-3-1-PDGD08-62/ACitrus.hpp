/*
** EPITECH PROJECT, 2026
** pool
** File description:
** ACitrus.hpp
*/

#ifndef ACITRUS_HPP
#define ACITRUS_HPP

#include "AFruit.hpp"

class ACitrus : public AFruit {
    public:
        ACitrus(std::string const &name, unsigned int vitamins);
        virtual ~ACitrus();
};

#endif
