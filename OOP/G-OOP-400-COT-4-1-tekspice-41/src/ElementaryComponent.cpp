/*
** EPITECH PROJECT, 2026
** ElementaryComponent.cpp
** File description:
** Elementary components implementation
*/

#include "ElementaryComponent.hpp"

bool nts::AndComponent::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 3)
        return true;
    return false;
}

nts::Tristate nts::AndComponent::compute(std::size_t pin)
{
    if (pin != 3)
        return nts::Undefined;

    nts::Tristate v1 = getLink(1);
    nts::Tristate v2 = getLink(2);

    if (v1 == nts::False || v2 == nts::False)
        return nts::False;
    if (v1 == nts::True && v2 == nts::True)
        return nts::True;
    return nts::Undefined;
}

bool nts::OrComponent::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 3)
        return true;
    return false;
}

nts::Tristate nts::OrComponent::compute(std::size_t pin)
{
    if (pin != 3)
        return nts::Undefined;

    nts::Tristate v1 = getLink(1);
    nts::Tristate v2 = getLink(2);

    if (v1 == nts::True || v2 == nts::True)
        return nts::True;
    if (v1 == nts::False && v2 == nts::False)
        return nts::False;
    return nts::Undefined;
}

bool nts::XorComponent::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 3)
        return true;
    return false;
}

nts::Tristate nts::XorComponent::compute(std::size_t pin)
{
    if (pin != 3)
        return nts::Undefined;

    nts::Tristate v1 = getLink(1);
    nts::Tristate v2 = getLink(2);

    if (v1 == nts::Undefined || v2 == nts::Undefined)
        return nts::Undefined;
    if (v1 == v2)
        return nts::False;
    return nts::True;
}

bool nts::NotComponent::checkPin(std::size_t pin) const
{
    if (pin >= 1 && pin <= 2)
        return true;
    return false;
}

nts::Tristate nts::NotComponent::compute(std::size_t pin)
{
    if (pin != 2)
        return nts::Undefined; 

    nts::Tristate res = getLink(1);
    if (res == nts::True)
        return nts::False;
    if (res == nts::False)
        return nts::True;
    return nts::Undefined;
}
