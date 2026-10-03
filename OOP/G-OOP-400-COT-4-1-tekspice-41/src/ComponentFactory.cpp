/*
** EPITECH PROJECT, 2026
** ComponentFactory.cpp
** File description:
** ComponentFactory implementation
*/

#include "ComponentFactory.hpp"
#include "SpecialComponent.hpp"
#include "ElementaryComponent.hpp"
#include "Error.hpp"
#include <cstdio>
#include <algorithm>

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createComponent(const std::string &type)
{
    if (type.empty() == true)
        throw handle_Error("Ce type : " + type + ", de composant est inconnu.");

    if (type == "input") return createInput();
    if (type == "output") return createOutput();
    if (type == "true") return createTrue();
    if (type == "false") return createFalse();
    if (type == "clock") return createClock();
    if (type == "and") return createAnd();
    if (type == "or") return createOr();
    if (type == "xor") return createXor();
    if (type == "not") return createNot();
    if (type == "4001") return create4001();
    if (type == "4011") return create4011();
    if (type == "4030") return create4030();
    if (type == "4069") return create4069();
    if (type == "4071") return create4071();
    if (type == "4081") return create4081();

    throw handle_Error("Ce type : " + type + ", de composant est inconnu.");
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createInput()
{
    return std::make_unique<nts::InputComponent>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createOutput()
{
    return std::make_unique<nts::OutputComponent>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createTrue()
{
    return std::make_unique<nts::TrueComponent>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createFalse()
{
    return std::make_unique<nts::FalseComponent>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createClock()
{
    return std::make_unique<nts::ClockComponent>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createAnd()
{
    return std::make_unique<nts::AndComponent>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createOr()
{
    return std::make_unique<nts::OrComponent>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createXor()
{
    return std::make_unique<nts::XorComponent>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::createNot()
{
    return std::make_unique<nts::NotComponent>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::create4071()
{
    return std::make_unique<nts::C4071Component>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::create4001()
{
    return std::make_unique<nts::C4001Component>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::create4011()
{
    return std::make_unique<nts::C4011Component>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::create4030()
{
    return std::make_unique<nts::C4030Component>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::create4069()
{
    return std::make_unique<nts::C4069Component>();
}

std::unique_ptr<nts::IComponent> nts::ComponentFactory::create4081()
{
    return std::make_unique<nts::C4081Component>();
}
