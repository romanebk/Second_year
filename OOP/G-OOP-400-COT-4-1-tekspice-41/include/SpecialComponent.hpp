/*
** EPITECH PROJECT, 2024
** SpecialComponent.hpp
** File description:
** Special components: input, output, true, false, clock
*/

#ifndef SPECIALCOMPONENT_HPP
#define SPECIALCOMPONENT_HPP
#include "AComponent.hpp"

namespace nts {
    class TrueComponent : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class FalseComponent : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class InputComponent : public AComponent {
        public:
            InputComponent();
            virtual ~InputComponent() = default;
            void simulate(std::size_t tick) override;
            Tristate compute(std::size_t pin) override;
            void setValue(Tristate value);
            bool checkPin(std::size_t pin) const override;
        protected:
            Tristate _value;
            Tristate _pendingValue;
            bool _has_manual_update;
    };
    
    class OutputComponent : public AComponent {
        public:
            Tristate compute(std::size_t pin) override;
            bool checkPin(std::size_t pin) const override;
    };

    class ClockComponent : public InputComponent {
        public:
            ClockComponent() = default;
            void simulate(std::size_t tick) override;
            bool checkPin(std::size_t pin) const override;
    };
}

#endif
