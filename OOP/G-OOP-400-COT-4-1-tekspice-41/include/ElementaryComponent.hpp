/*
** EPITECH PROJECT, 2024
** ElementaryComponent.hpp
** File description:
** Elementary components: and, or, xor, not
*/

#ifndef ELEMENTARYCOMPONENT_HPP
#define ELEMENTARYCOMPONENT_HPP
#include "AComponent.hpp"

namespace nts {
    class AndComponent : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class OrComponent : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class XorComponent : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class NotComponent : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };
}

#endif
