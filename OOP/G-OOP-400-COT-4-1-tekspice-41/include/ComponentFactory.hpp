/*
** EPITECH PROJECT, 2026
** ComponentFactory.hpp
** File description:
** ComponentFactory declaration
*/

#pragma once
#include <memory>
#include <string>
#include "IComponent.hpp"
#include <map>
#include <functional>
#include "SpecialComponent.hpp"
#include "ElementaryComponent.hpp"
#include "GateComponent.hpp"

namespace nts {
    class ComponentFactory {
        public:
            std::unique_ptr<nts::IComponent> createComponent(const std::string &type);
            ~ComponentFactory() = default;

        private:
            std::unique_ptr<nts::IComponent> createInput();
            std::unique_ptr<nts::IComponent> createOutput();
            std::unique_ptr<nts::IComponent> createTrue();
            std::unique_ptr<nts::IComponent> createFalse();
            std::unique_ptr<nts::IComponent> createClock();

            std::unique_ptr<nts::IComponent> createAnd();
            std::unique_ptr<nts::IComponent> createOr();
            std::unique_ptr<nts::IComponent> createXor();
            std::unique_ptr<nts::IComponent> createNot();

            std::unique_ptr<nts::IComponent> create4001();
            std::unique_ptr<nts::IComponent> create4011();
            std::unique_ptr<nts::IComponent> create4030();
            std::unique_ptr<nts::IComponent> create4069();
            std::unique_ptr<nts::IComponent> create4071();
            std::unique_ptr<nts::IComponent> create4081();
    };
}
