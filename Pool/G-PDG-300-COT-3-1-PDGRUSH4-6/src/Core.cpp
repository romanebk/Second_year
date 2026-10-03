/*
** EPITECH PROJECT, 2024
** Core.cpp
** File description:
** Core.cpp
*/

#include "Core.hpp"

Core::Core(Krell::IDisplay* display) : _display(display) {}

Core::~Core() {
    for (auto module : _modules) {
        delete module;
    }
    _modules.clear();
}
void Core::addModule(Krell::IModule* module) 
{
    if (module)
        _modules.push_back(module);
}

void Core::run() 
{
    _display->init();
    while (_display->isOpen()) {
        for (auto module : _modules) {
            module->update(); 
        }
        _display->render(_modules); 
    }
    _display->close();
}