/*
** EPITECH PROJECT, 2026
** ingredient
** File description:
** ingredient
*/

#ifndef INGREDIENT_H
    #define INGREDIENT_H

#include "Pizza.hpp"

#include <array>
#include <string>

enum class Ingredient : std::size_t {
    Dough,
    Tomato,
    Gruyere,
    Ham,
    Mushrooms,
    Steak,
    Eggplant,
    GoatCheese,
    ChiefLove,
    Count
};

constexpr std::size_t kInitialStockPerIngredient = 5;

using IngredientStock = std::array<int, static_cast<std::size_t>(Ingredient::Count)>;

std::string ingredientToString(Ingredient ingredient);
IngredientStock stockForPizza(PizzaType type);

#endif
