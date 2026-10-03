/*
** EPITECH PROJECT, 2024
** AComponent.hpp
** File description:
** IComponent.hpp
*/

#ifndef ACOMPONENT_HPP
#define ACOMPONENT_HPP
#include "IComponent.hpp"
#include <map>
#include <string>
#include <utility>

namespace nts {
    class AComponent : public IComponent {
        public:
            virtual ~AComponent() = default;
            virtual void setLink(std::size_t pin, nts::IComponent &other, std::size_t otherPin) override;
            virtual nts::Tristate compute(std::size_t pin) override = 0;
            virtual void simulate(std::size_t tick) override;
        protected:
            nts::Tristate getLink(std::size_t pin);
            virtual bool checkPin(std::size_t pin) const = 0;
            bool _computing = false;
        private:
            std::map<std::size_t, std::pair<nts::IComponent *, std::size_t>> _links;
    };
}

#endif
