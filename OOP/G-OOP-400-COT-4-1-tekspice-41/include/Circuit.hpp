/*
** EPITECH PROJECT, 2024
** Circuit.hpp
** File description:
** Circuit class declaration for managing component graph
*/
#ifndef CIRCUIT_HPP
#define CIRCUIT_HPP

#include "IComponent.hpp"
#include "SpecialComponent.hpp"
#include "ElementaryComponent.hpp"
#include "Error.hpp"
#include <string>
#include <map>
#include <memory>
#include <iostream>

namespace nts {
    class Circuit {
    public:
        Circuit() = default;
        ~Circuit() = default;

        void addComponent(const std::string &name, std::unique_ptr<IComponent> component);
        IComponent& getComponent(const std::string &name);
        void setInputValue(const std::string &name, const std::string &value);
        void simulate(std::size_t tick);
        void display(std::size_t tick);

    private:
        std::map<std::string, std::unique_ptr<IComponent>> _components;
    };
}

#endif