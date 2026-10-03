/*
** EPITECH PROJECT, 2026
** pool
** File description:
** BloodOrange.hpp
*/

#ifndef BLOODORANGE_HPP
#define BLOODORANGE_HPP

#include "Orange.hpp"

class BloodOrange : virtual public Orange, virtual public ACitrus {
    public:
        BloodOrange();
        ~BloodOrange();
};

#endif
