/*
** EPITECH PROJECT, 2026
** GateComponent.cpp
** File description:
** Gate components implementation
*/
#include "GateComponent.hpp"

static nts::Tristate triOR(nts::Tristate a, nts::Tristate b)
{
    if (a == nts::True || b == nts::True)
        return nts::True;
    if (a == nts::False && b == nts::False)
        return nts::False;
    return nts::Undefined;
}

static nts::Tristate triAND(nts::Tristate a, nts::Tristate b)
{
    if (a == nts::False || b == nts::False)
        return nts::False;
    if (a == nts::True && b == nts::True)
        return nts::True;
    return nts::Undefined;
}

static nts::Tristate triXOR(nts::Tristate a, nts::Tristate b)
{
    if (a == nts::Undefined || b == nts::Undefined)
        return nts::Undefined;
    if (a == b)
        return nts::False;
    return nts::True;
}

static nts::Tristate triNOT(nts::Tristate a)
{
    if (a == nts::True)
        return nts::False;
    if (a == nts::False)
        return nts::True;
    return nts::Undefined;
}

bool nts::C4001Component::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 13)
        return true;
    return false;
}

nts::Tristate nts::C4001Component::compute(std::size_t pin)
{
    if (pin == 3)
        return triNOT(triOR(getLink(1), getLink(2)));
    if (pin == 4)
        return triNOT(triOR(getLink(5), getLink(6)));
    if (pin == 10)
        return triNOT(triOR(getLink(8), getLink(9)));
    if (pin == 11)
        return triNOT(triOR(getLink(12), getLink(13)));
    return nts::Undefined;
}

bool nts::C4011Component::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 13)
        return true;
    return false;
}

nts::Tristate nts::C4011Component::compute(std::size_t pin)
{
    if (pin == 3)
        return triNOT(triAND(getLink(1), getLink(2)));
    if (pin == 4)
        return triNOT(triAND(getLink(5), getLink(6)));
    if (pin == 10)
        return triNOT(triAND(getLink(8), getLink(9)));
    if (pin == 11)
        return triNOT(triAND(getLink(12), getLink(13)));
    return nts::Undefined;
}

bool nts::C4030Component::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 13)
        return true;
    return false;
}

nts::Tristate nts::C4030Component::compute(std::size_t pin)
{
    if (pin == 3)
        return triXOR(getLink(1), getLink(2));
    if (pin == 4)
        return triXOR(getLink(5), getLink(6));
    if (pin == 10)
        return triXOR(getLink(8), getLink(9));
    if (pin == 11)
        return triXOR(getLink(12), getLink(13));
    return nts::Undefined;
}

bool nts::C4069Component::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 13)
        return true;
    return false;
}

nts::Tristate nts::C4069Component::compute(std::size_t pin)
{
    if (pin == 2)
        return triNOT(getLink(1));
    if (pin == 4)
        return triNOT(getLink(3));
    if (pin == 6)
        return triNOT(getLink(5));
    if (pin == 8)
        return triNOT(getLink(9));
    if (pin == 10)
        return triNOT(getLink(11));
    if (pin == 12)
        return triNOT(getLink(13));
    return nts::Undefined;
}

bool nts::C4071Component::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 13)
        return true;
    return false;
}

nts::Tristate nts::C4071Component::compute(std::size_t pin)
{
    if (pin == 3)
        return triOR(getLink(1), getLink(2));
    if (pin == 4)
        return triOR(getLink(5), getLink(6));
    if (pin == 10)
        return triOR(getLink(8), getLink(9));
    if (pin == 11)
        return triOR(getLink(12), getLink(13));
    return nts::Undefined;
}

bool nts::C4081Component::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 13)
        return true;
    return false;
}

nts::Tristate nts::C4081Component::compute(std::size_t pin)
{
    if (pin == 3)
        return triAND(getLink(1), getLink(2));
    if (pin == 4)
        return triAND(getLink(5), getLink(6));
    if (pin == 10)
        return triAND(getLink(8), getLink(9));
    if (pin == 11)
        return triAND(getLink(12), getLink(13));
    return nts::Undefined;
}
