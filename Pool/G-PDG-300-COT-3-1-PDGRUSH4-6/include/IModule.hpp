/*
** EPITECH PROJECT, 2024
** IMonitorModule.hpp
** File description:
** IMonitorModule.hpp
*/

#ifndef IMONITORMODULE_HPP
#define IMONITORMODULE_HPP

#include <string>
#include <vector>

namespace Krell {
    class IModule {
    public:
        virtual ~IModule() {}
        virtual void update() = 0;
        virtual std::string getName() const = 0;
        virtual std::vector<std::string> getData() const = 0;
    };
}

#endif