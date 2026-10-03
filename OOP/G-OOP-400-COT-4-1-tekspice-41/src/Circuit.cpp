/*
** EPITECH PROJECT, 2024
** Circuit.cpp
** File description:
** Circuit class implementation for managing component graph
*/

#include "Circuit.hpp"
#include "Error.hpp"

void nts::Circuit::addComponent(const std::string& name, std::unique_ptr<nts::IComponent> component)
{
    if (_components.find(name) != _components.end())
        throw handle_Error("Composant déclaré plusieurs fois: " + name);
    _components[name] = std::move(component);
}

nts::IComponent& nts::Circuit::getComponent(const std::string &name)
{
    if (_components.find(name) == _components.end())
        throw handle_Error("Composant inconnu : " + name);
    return *_components[name];
}

void nts::Circuit::setInputValue(const std::string &name, const std::string &value)
{
    auto it = _components.find(name);
    if (it == _components.end())
        throw handle_Error("Composant inconnu : " + name);

    auto* input = dynamic_cast<nts::InputComponent*>(it->second.get());
    nts::Tristate state = (value == "1" ? nts::True : (value == "0" ? nts::False : nts::Undefined));

    if (input)
        input->setValue(state);
    else
        throw handle_Error("Le composant " + name + " n'est pas une entrée.");
}

void nts::Circuit::simulate(std::size_t tick)
{
    for (auto& [name, component] : _components)
        component->simulate(tick);
}

void nts::Circuit::display(std::size_t tick)
{
    std::cout << "tick: " << tick << std::endl;
    std::cout << "input(s):" << std::endl;
    for (const auto& [name, component] : _components) {
        if (dynamic_cast<nts::InputComponent*>(component.get())) {
            nts::Tristate value = component->compute(1);
            std::string state = (value == nts::True ? "1" : (value == nts::False ? "0" : "U"));
            std::cout << "  " << name << ": " << state << std::endl;
        }
    }

    std::cout << "output(s):" << std::endl;
    for (const auto& [name, component] : _components) {
        if (dynamic_cast<nts::OutputComponent*>(component.get())) {
            nts::Tristate value = component->compute(1);
            std::string state = (value == nts::True ? "1" : (value == nts::False ? "0" : "U"));
            std::cout << "  " << name << ": " << state << std::endl;
        }
    }
}