/*
** EPITECH PROJECT, 2026
** pool
** File description:
** FruitUtils.hpp
*/

#ifndef FRUITUTILS_HPP
#define FRUITUTILS_HPP

#include "FruitBox.hpp"
#include "IFruit.hpp"
#include "AFruit.hpp"
#include "ABerry.hpp"
#include "ACitrus.hpp"
#include "ANut.hpp"
#include "Raspberry.hpp"
#include "Strawberry.hpp"
#include "BloodOrange.hpp"
#include "Grapefruit.hpp"
#include "Coconut.hpp"
#include "Lemon.hpp"
#include "Orange.hpp"

class FruitUtils {
    public:
        static void sort(FruitBox& unsorted, FruitBox& lemon, FruitBox& citrus, FruitBox& berry);
        static FruitBox** pack(IFruit** fruits, unsigned int boxSize);
        static IFruit** unpack(FruitBox** fruitBoxes);
};

#endif
