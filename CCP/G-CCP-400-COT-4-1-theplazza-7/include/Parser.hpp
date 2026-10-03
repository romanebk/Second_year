/*
** EPITECH PROJECT, 2026
** parser
** File description:
** parser
*/

#ifndef PARSER_H
    #define PARSER_H

#include "Pizza.hpp"

#include <string>
#include <vector>

struct PizzaOrder {
    PizzaType type;
    PizzaSize size;
    int quantity;
};

class Parser {
public:
    static bool parse(const std::string &line, std::vector<PizzaOrder> &orders,
                      std::string &error);
};

#endif
