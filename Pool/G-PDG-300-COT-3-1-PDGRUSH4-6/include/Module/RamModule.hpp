/*
** EPITECH PROJECT, 2024
** RamModule.hpp
** File description:
** RamModule.hpp
*/

#ifndef RAMMODULE_HPP
#define RAMMODULE_HPP

#include "IModule.hpp"
#include <string>
#include <vector>

class RamModule : public Krell::IModule {
public:
    RamModule();
    ~RamModule();

    void update();
    std::string getName() const;
    std::vector<std::string> getData() const;

private:
    unsigned long _total;
    unsigned long _free;
};

#endif
