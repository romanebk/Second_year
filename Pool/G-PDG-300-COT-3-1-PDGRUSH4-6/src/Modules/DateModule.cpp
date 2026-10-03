/*
** EPITECH PROJECT, 2024
** DateModule.cpp
** File description:
** DateModule.cpp
*/

#include "../include/Module/DateModule.hpp"
#include <chrono>
#include <ctime>

DateModule::DateModule()
{
    update();
}

DateModule::~DateModule()
{
}

void DateModule::update()
{
    auto now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    char buf[100];
    std::strftime(buf, sizeof(buf), "%d/%m/%Y %H:%M:%S", std::localtime(&now));
    _dateTime = std::string(buf);
}

std::string DateModule::getName() const
{
    return "Date/Time";
}

std::vector<std::string> DateModule::getData() const
{
    std::vector<std::string> data;
    data.push_back("Date/Time: " + _dateTime);
    return data;
}
