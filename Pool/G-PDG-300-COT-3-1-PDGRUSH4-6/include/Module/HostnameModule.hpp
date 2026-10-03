/*
** EPITECH PROJECT, 2024
** HostnameModule.hpp
** File description:
** HostnameModule.hpp
*/

#ifndef HOSTNAMEMODULE_HPP
#define HOSTNAMEMODULE_HPP

#include "IModule.hpp"
#include <string>
#include <vector>

class HostnameModule : public Krell::IModule {
public:
    HostnameModule();
    ~HostnameModule();

    void update();
    std::string getName() const;
    std::vector<std::string> getData() const;

private:
    std::string _hostname;
    std::string _username;
};

#endif
