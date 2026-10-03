/*
** EPITECH PROJECT, 2024
** IComponent.hpp
** File description:
** IComponent.hpp
*/

#ifndef ICOMPONENT_HPP
#define ICOMPONENT_HPP

#include <string>
#include <vector>
#include <list>
#include <iostream>
#include <string>

namespace nts {
    enum Tristate {
        True = 1,
        False = 0,
        Undefined = -1,
    };
    class IComponent {
    public:
        virtual ~IComponent() = default;
        virtual nts::Tristate compute(std::size_t pin) = 0;
        virtual void simulate(std::size_t tick) = 0;
        virtual void setLink(std::size_t pin, nts::IComponent &other, std::size_t otherPin) = 0;
    };
}

#endif