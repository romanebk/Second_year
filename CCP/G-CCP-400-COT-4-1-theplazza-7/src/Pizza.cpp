/*
** EPITECH PROJECT, 2026
** pizza
** File description:
** pizza
*/

#include "Pizza.hpp"
#include "PlazzaException.hpp"
#include <cctype>
#include <cmath>

Pizza::Pizza(PizzaType t, PizzaSize s) : type(t), size(s) {}

PizzaType Pizza::getType() const
{
    return type;
}

PizzaSize Pizza::getSize() const
{
    return size;
}

std::string Pizza::getName() const
{
    return pizzaTypeToString(type) + " " + pizzaSizeToString(size);
}

int Pizza::getBaseCookTimeSeconds(PizzaType t)
{
    if (t == Margarita)
        return 1;
    if (t == Regina || t == Americana)
        return 2;
    if (t == Fantasia)
        return 4;
    return 1;
}

int Pizza::getCookTimeMs(double multiplier) const
{
    int base = getBaseCookTimeSeconds(type);
    return static_cast<int>(std::lround(base * 1000.0 * multiplier));
}

std::vector<std::uint8_t> Pizza::pack() const
{
    return {
        static_cast<std::uint8_t>(type),
        static_cast<std::uint8_t>(size),
    };
}

Pizza Pizza::unpack(const std::vector<std::uint8_t> &data)
{
    if (data.size() < 2)
        throw PizzaException("invalid packed pizza");
    return Pizza(
        static_cast<PizzaType>(data[0]),
        static_cast<PizzaSize>(data[1])
    );
}

static std::string toLower(const std::string &str)
{
    std::string result = str;
    for (std::size_t i = 0; i < result.size(); ++i)
        result[i] = static_cast<char>(std::tolower(result[i]));
    return result;
}

PizzaType pizzaTypeFromName(const std::string &name)
{
    const std::string lower = toLower(name);
    if (lower == "regina")
        return Regina;
    if (lower == "margarita")
        return Margarita;
    if (lower == "americana")
        return Americana;
    if (lower == "fantasia")
        return Fantasia;
    throw PizzaException("unknown pizza type: " + name);
}

PizzaSize pizzaSizeFromToken(const std::string &token)
{
    if (token == "S")
        return S;
    if (token == "M")
        return M;
    if (token == "L")
        return L;
    if (token == "XL")
        return XL;
    if (token == "XXL")
        return XXL;
    throw PizzaException("unknown pizza size: " + token);
}

std::string pizzaTypeToString(PizzaType t)
{
    if (t == Regina)
        return "regina";
    if (t == Margarita)
        return "margarita";
    if (t == Americana)
        return "americana";
    if (t == Fantasia)
        return "fantasia";
    return "unknown";
}

std::string pizzaSizeToString(PizzaSize s)
{
    if (s == S)
        return "S";
    if (s == M)
        return "M";
    if (s == L)
        return "L";
    if (s == XL)
        return "XL";
    if (s == XXL)
        return "XXL";
    return "?";
}
