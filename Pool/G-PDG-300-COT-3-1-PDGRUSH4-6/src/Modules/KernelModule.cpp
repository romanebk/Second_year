/*
** EPITECH PROJECT, 2024
** KernelModule.cpp
** File description:
** KernelModule.cpp
*/

#include "../include/Module/KernelModule.hpp"
#include <sys/utsname.h>

KernelModule::KernelModule()
{
    update();
}

KernelModule::~KernelModule()
{
}

void KernelModule::update()
{
    struct utsname buffer;
    uname(&buffer);
    _os = buffer.sysname;
    _kernel = buffer.release;
}

std::string KernelModule::getName() const
{
    return "OS/Kernel";
}

std::vector<std::string> KernelModule::getData() const
{
    std::vector<std::string> data;
    data.push_back("OS: " + _os);
    data.push_back("Kernel: " + _kernel);
    return data;
}
