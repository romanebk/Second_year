/*
** EPITECH PROJECT, 2024
** IMonitorDisplay.hpp
** File description:
** IMonitorDisplay.hpp
*/

#ifndef IMONITORDISPLAY_HPP
#define IMONITORDISPLAY_HPP

#include "IModule.hpp"
#include <vector>

namespace Krell {
    class IDisplay {
    public:
        virtual ~IDisplay() {}
        virtual void init() = 0;
        virtual void render(const std::vector<IModule*>& modules) = 0;
        virtual bool isOpen() const = 0;
        virtual void close() = 0;
    };
}

#endif
