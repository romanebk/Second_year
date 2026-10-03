/*
** EPITECH PROJECT, 2024
** ElementaryComponent.hpp
** File description:
** Elementary components: and, or, xor, not
*/

#ifndef GATECOMPONENT_HPP
#define GATECOMPONENT_HPP
#include "AComponent.hpp"

namespace nts {
    class C4001Component : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class C4011Component : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class C4030Component : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class C4069Component : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class C4071Component : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class C4081Component : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };
}
#endif