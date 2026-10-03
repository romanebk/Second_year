/*
** EPITECH PROJECT, 2026
** SpecialComponent.cpp
** File description:
** Special components implementation
*/

#include "SpecialComponent.hpp"

bool nts::TrueComponent::checkPin(std::size_t pin) const
{
    if (pin == 1)
        return true;
    return false;
}

nts::Tristate nts::TrueComponent::compute(std::size_t pin)
{
    if (checkPin(pin) == false)
        return nts::Undefined;
    return nts::True;
}

bool nts::FalseComponent::checkPin(std::size_t pin) const
{
    if (pin == 1)
        return true;
    return false;
}
nts::Tristate nts::FalseComponent::compute(std::size_t pin)
{
    if (checkPin(pin) == false)
        return nts::Undefined;
    return nts::False;
}

nts::InputComponent::InputComponent() : _value(nts::Undefined), _pendingValue(nts::Undefined), _has_manual_update(false) {}

bool nts::InputComponent::checkPin(std::size_t pin) const
{
    if (pin == 1)
        return true;
    return false;
}

void nts::InputComponent::simulate(std::size_t tick)
{
    (void)tick;
    if (_has_manual_update == true) {
        _value = _pendingValue;
        _has_manual_update = false;
    }
}

void nts::InputComponent::setValue(nts::Tristate value)
{
    _pendingValue = value;
    _has_manual_update = true;
}

nts::Tristate nts::InputComponent::compute(std::size_t pin)
{
    if (checkPin(pin) == false)
        return nts::Undefined;
    return _value;
}

bool nts::OutputComponent::checkPin(std::size_t pin) const
{
    if (pin == 1)
        return true;
    return false;
}

nts::Tristate nts::OutputComponent::compute(std::size_t pin)
{
    if (checkPin(pin) == false)
        return nts::Undefined;
    return getLink(pin);
}

bool nts::ClockComponent::checkPin(std::size_t pin) const
{
    if (pin == 1)
        return true;
    return false;
}

void nts::ClockComponent::simulate(std::size_t tick)
{
    (void)tick;
    if (_has_manual_update) {
        _value = _pendingValue;
        _has_manual_update = false;
        return;
    }
    if (_value == nts::True)
        _value = nts::False;
    else if (_value == nts::False)
        _value = nts::True;
}