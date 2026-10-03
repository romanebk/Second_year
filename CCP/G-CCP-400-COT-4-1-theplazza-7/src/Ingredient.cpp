/*
** EPITECH PROJECT, 2026
** ingredient
** File description:
** ingredient
*/

#include "Ingredient.hpp"

std::string ingredientToString(Ingredient ingredient)
{
    if (ingredient == Ingredient::Dough)
        return "dough";
    if (ingredient == Ingredient::Tomato)
        return "tomato";
    if (ingredient == Ingredient::Gruyere)
        return "gruyere";
    if (ingredient == Ingredient::Ham)
        return "ham";
    if (ingredient == Ingredient::Mushrooms)
        return "mushrooms";
    if (ingredient == Ingredient::Steak)
        return "steak";
    if (ingredient == Ingredient::Eggplant)
        return "eggplant";
    if (ingredient == Ingredient::GoatCheese)
        return "goat_cheese";
    if (ingredient == Ingredient::ChiefLove)
        return "chief_love";
    return "unknown";
}

static void setIngredient(IngredientStock &stock, Ingredient ing, int amount)
{
    stock[static_cast<std::size_t>(ing)] = amount;
}

static void addBaseIngredients(IngredientStock &stock)
{
    setIngredient(stock, Ingredient::Dough, 1);
    setIngredient(stock, Ingredient::Tomato, 1);
}

static void addMargaritaIngredients(IngredientStock &stock)
{
    setIngredient(stock, Ingredient::Gruyere, 1);
}

static void addReginaIngredients(IngredientStock &stock)
{
    setIngredient(stock, Ingredient::Gruyere, 1);
    setIngredient(stock, Ingredient::Ham, 1);
    setIngredient(stock, Ingredient::Mushrooms, 1);
}

static void addAmericanaIngredients(IngredientStock &stock)
{
    setIngredient(stock, Ingredient::Gruyere, 1);
    setIngredient(stock, Ingredient::Steak, 1);
}

static void addFantasiaIngredients(IngredientStock &stock)
{
    setIngredient(stock, Ingredient::Eggplant, 1);
    setIngredient(stock, Ingredient::GoatCheese, 1);
    setIngredient(stock, Ingredient::ChiefLove, 1);
}

IngredientStock stockForPizza(PizzaType type)
{
    IngredientStock stock{};
    addBaseIngredients(stock);

    if (type == Margarita)
        addMargaritaIngredients(stock);
    if (type == Regina)
        addReginaIngredients(stock);
    if (type == Americana)
        addAmericanaIngredients(stock);
    if (type == Fantasia)
        addFantasiaIngredients(stock);

    return stock;
}
