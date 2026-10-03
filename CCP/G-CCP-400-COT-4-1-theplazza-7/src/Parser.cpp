/*
** EPITECH PROJECT, 2026
** parser
** File description:
** parser
*/

#include "Parser.hpp"

#include <cctype>
#include <sstream>
#include <vector>

namespace {

bool isAlphaString(const std::string &value)
{
    if (value.empty())
        return false;
    for (unsigned char c : value) {
        if (!std::isalpha(c))
            return false;
    }
    return true;
}

bool parseQuantityToken(const std::string &token, int &quantity)
{
    if (token.size() < 2 || token[0] != 'x')
        return false;
    if (token[1] < '1' || token[1] > '9')
        return false;
    for (std::size_t i = 2; i < token.size(); ++i) {
        if (!std::isdigit(static_cast<unsigned char>(token[i])))
            return false;
    }
    quantity = std::stoi(token.substr(1));
    return quantity > 0;
}

std::vector<std::string> splitBySemicolon(const std::string &line)
{
    std::vector<std::string> parts;
    std::string current;
    for (char c : line) {
        if (c == ';') {
            parts.push_back(current);
            current.clear();
        } else {
            current.push_back(c);
        }
    }
    parts.push_back(current);
    return parts;
}

bool parseSingleOrder(const std::string &orderText, PizzaOrder &order, std::string &error)
{
    std::istringstream input(orderText);
    std::string typeToken;
    std::string sizeToken;
    std::string quantityToken;

    if (!(input >> typeToken >> sizeToken >> quantityToken)) {
        error = "incomplete order (expected: type size xN)";
        return false;
    }

    std::string extra;
    if (input >> extra) {
        error = "too many tokens in one order";
        return false;
    }

    if (!isAlphaString(typeToken)) {
        error = "invalid pizza type";
        return false;
    }

    PizzaType type;
    PizzaSize size;
    try {
        type = pizzaTypeFromName(typeToken);
        size = pizzaSizeFromToken(sizeToken);
    } catch (const std::exception &) {
        error = "unknown pizza type or size";
        return false;
    }

    int quantity = 0;
    if (!parseQuantityToken(quantityToken, quantity)) {
        error = "invalid quantity";
        return false;
    }

    order = PizzaOrder{type, size, quantity};
    return true;
}

} // namespace

bool Parser::parse(const std::string &line, std::vector<PizzaOrder> &orders,
                   std::string &error)
{
    orders.clear();

    const std::vector<std::string> parts = splitBySemicolon(line);
    for (const std::string &part : parts) {
        if (part.find_first_not_of(" \t") == std::string::npos)
            continue;
        PizzaOrder order{};
        if (!parseSingleOrder(part, order, error))
            return false;
        orders.push_back(order);
    }
    if (orders.empty()) {
        error = "empty order";
        return false;
    }
    return true;
}
