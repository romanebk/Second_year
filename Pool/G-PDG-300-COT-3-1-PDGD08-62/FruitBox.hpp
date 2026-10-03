/*
** EPITECH PROJECT, 2026
** pool
** File description:
** FruitBox.hpp
*/

#ifndef FRUITBOX_HPP
#define FRUITBOX_HPP

#include <list>
#include "IFruit.hpp"
#include <iostream>
#include <string>
#include <sstream>
#include <algorithm>

class FruitBox {
    public:
        FruitBox(unsigned int size);
        ~FruitBox();
        FruitBox(const FruitBox &other) = delete;
        FruitBox &operator=(const FruitBox &other) = delete;
        unsigned int getSize() const;
        unsigned int nbFruits() const;
        bool pushFruit(IFruit *fruit);
        IFruit *popFruit();
        const std::list<IFruit*> &getFruits() const;
    private:
        unsigned int _size;
        std::list<IFruit*> _fruits;
};

std::ostream &operator<<(std::ostream &os, const FruitBox &box);

#endif
