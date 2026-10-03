/*
** EPITECH PROJECT, 2026
** pool
** File description:
** ABerry.cpp
*/

#include "ABerry.hpp"

ABerry::ABerry(std::string const &name, unsigned int vitamins) : AFruit(name, vitamins) {
    _peeled = true;
}

ABerry::~ABerry() {}