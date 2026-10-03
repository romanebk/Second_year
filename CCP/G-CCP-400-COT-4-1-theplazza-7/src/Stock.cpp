/*
** EPITECH PROJECT, 2026
** stock
** File description:
** stock
*/

#include "Stock.hpp"

#include "sync/LockGuard.hpp"

Stock::Stock()
{
    for (auto &amount : _stock)
        amount = static_cast<int>(kInitialStockPerIngredient);
}

bool Stock::takeFor(PizzaType type)
{
    const IngredientStock needs = stockForPizza(type);
    LockGuard guard(_mutex);

    for (std::size_t i = 0; i < _stock.size(); ++i) {
        if (_stock[i] < needs[i])
            return false;
    }
    for (std::size_t i = 0; i < _stock.size(); ++i)
        _stock[i] -= needs[i];
    return true;
}

void Stock::regenerate()
{
    LockGuard guard(_mutex);
    for (auto &amount : _stock)
        amount += 1;
}

IngredientStock Stock::snapshot() const
{
    LockGuard guard(_mutex);
    return _stock;
}