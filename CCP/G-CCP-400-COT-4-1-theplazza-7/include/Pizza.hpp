/*
** EPITECH PROJECT, 2026
** pizza
** File description:
** pizza
*/

#ifndef PIZZA_H
    #define PIZZA_H

#include <cstdint>
#include <string>
#include <vector>

enum PizzaType : std::uint8_t {
    Regina = 1,
    Margarita = 2,
    Americana = 4,
    Fantasia = 8
};

enum PizzaSize : std::uint8_t {
    S = 1,
    M = 2,
    L = 4,
    XL = 8,
    XXL = 16
};

class Pizza {
public:
    Pizza() = default;
    Pizza(PizzaType type, PizzaSize size);

    PizzaType getType() const;
    PizzaSize getSize() const;
    std::string getName() const;
    int getCookTimeMs(double multiplier) const;
    static int getBaseCookTimeSeconds(PizzaType type);

    std::vector<std::uint8_t> pack() const;
    static Pizza unpack(const std::vector<std::uint8_t> &data);

private:
    PizzaType type{Margarita};
    PizzaSize size{S};
};

PizzaType pizzaTypeFromName(const std::string &name);
PizzaSize pizzaSizeFromToken(const std::string &token);
std::string pizzaTypeToString(PizzaType type);
std::string pizzaSizeToString(PizzaSize size);

#endif
