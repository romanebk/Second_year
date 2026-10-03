/*
** EPITECH PROJECT, 2026
** stock
** File description:
** stock
*/

#ifndef STOCK_H
    #define STOCK_H

#include "Ingredient.hpp"
#include "sync/Mutex.hpp"

class Stock {
public:
    Stock();

    bool takeFor(PizzaType type);
    void regenerate();
    IngredientStock snapshot() const;

private:
    mutable Mutex _mutex;
    IngredientStock _stock{};
};

#endif
