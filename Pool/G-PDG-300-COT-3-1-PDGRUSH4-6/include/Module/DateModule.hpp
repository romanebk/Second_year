/*
** EPITECH PROJECT, 2024
** DateModule.hpp
** File description:
** DateModule.hpp
*/

#ifndef DATEMODULE_HPP
#define DATEMODULE_HPP

#include "IModule.hpp"
#include <string>
#include <vector>

class DateModule : public Krell::IModule {
public:
    DateModule();
    ~DateModule();

    void update();
    std::string getName() const;
    std::vector<std::string> getData() const;

private:
    std::string _dateTime;
};

#endif
