/*
** EPITECH PROJECT, 2024
** AComponent.cpp
** File description:
** AComponent.cpp
*/

#include "AComponent.hpp"
#include "Error.hpp"
#include "AComponent.hpp"
#include "Error.hpp"

void nts::AComponent::simulate(std::size_t tick)
{
    (void)tick;
}

void nts::AComponent::setLink(std::size_t pin, nts::IComponent &other, std::size_t otherPin)
{
    if (checkPin(pin) == false)
        throw handle_Error("Invalid pin number" + std::to_string(pin));
    _links[pin] = std::make_pair(&other, otherPin);
}

nts::Tristate nts::AComponent::getLink(std::size_t pin)
{
    auto it = _links.find(pin);
    if (it == _links.end())
        return nts::Undefined;

    AComponent *other = dynamic_cast<AComponent*>(it->second.first);
    if (other && other->_computing)
        return nts::Undefined;
    if (other)
        other->_computing = true;
    nts::Tristate result = it->second.first->compute(it->second.second);
    if (other)
        other->_computing = false;

    return result;
}