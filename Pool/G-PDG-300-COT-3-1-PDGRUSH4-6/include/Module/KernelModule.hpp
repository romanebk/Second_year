/*
** EPITECH PROJECT, 2024
** KernelModule.hpp
** File description:
** KernelModule.hpp
*/

#ifndef KERNELMODULE_HPP
#define KERNELMODULE_HPP

#include "IModule.hpp"
#include <string>
#include <vector>

class KernelModule : public Krell::IModule {
public:
    KernelModule();
    ~KernelModule();

    void update();
    std::string getName() const;
    std::vector<std::string> getData() const;

private:
    std::string _os;
    std::string _kernel;
};

#endif
