/*
** EPITECH PROJECT, 2024
** RamModule.cpp
** File description:
** RamModule.cpp
*/

#include "../include/Module/RamModule.hpp"
#include <sys/sysinfo.h>

RamModule::RamModule() 
{
    update();
}

RamModule::~RamModule() {}

void RamModule::update()
{
    struct sysinfo info;
    sysinfo(&info);
    _total = (unsigned long)info.totalram * info.mem_unit / 1024 / 1024;
    _free = (unsigned long)info.freeram * info.mem_unit / 1024 / 1024;
}

std::string RamModule::getName() const
{
    return "RAM";
}

std::vector<std::string> RamModule::getData() const
{
    std::vector<std::string> data;
    unsigned long used = _total - _free;
    data.push_back("Used: " + std::to_string(used) + " MB");
    data.push_back("Total: " + std::to_string(_total) + " MB");
    return data;
}
