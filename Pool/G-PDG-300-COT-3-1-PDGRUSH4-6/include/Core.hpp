/*
** EPITECH PROJECT, 2024
** Core.hpp
** File description:
** Core.hpp
*/

#ifndef CORE_HPP
#define CORE_HPP

#include "IModule.hpp"
#include "IDisplay.hpp"
#include <vector>

class Core {
public:
    Core(Krell::IDisplay* display);
    ~Core();

    void addModule(Krell::IModule* module);
    void run();

private:
    Krell::IDisplay* _display;
    std::vector<Krell::IModule*> _modules;
};

#endif
