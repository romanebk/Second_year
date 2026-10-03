/*
** EPITECH PROJECT, 2024
** BatteryModule.cpp
** File description:
** BatteryModule.cpp
*/

#include "../include/Module/BatteryModule.hpp"
#include <filesystem>
#include <fstream>
#include <iostream>
#include <cstring>

BatteryModule::BatteryModule()
{
    update();
}

BatteryModule::~BatteryModule() {}

std::string BatteryModule::get_BAT_name(const std::string& root_to_BAT_file, const std::string& begin_of_BAT_name) const
{
    for (auto i = std::filesystem::directory_iterator(root_to_BAT_file); i != std::filesystem::directory_iterator(); i++) {
        std::string BAT_name = i->path().filename().string();
        if (strncmp(BAT_name.c_str(), begin_of_BAT_name.c_str(), begin_of_BAT_name.length()) == 0)
            return BAT_name;
    }
    return "";
}

void BatteryModule::update()
{
    std::string path = "/sys/class/power_supply/" + get_BAT_name("/sys/class/power_supply", "BAT") + "/capacity";
    std::ifstream file(path);
    std::string capacity;
    if (file >> capacity)
        _capacity = capacity + "%";
    else
        _capacity = "N/A";
}

std::string BatteryModule::getName() const
{
    return "Battery";
}

std::vector<std::string> BatteryModule::getData() const
{
    std::vector<std::string> data;
    data.push_back("Battery: " + _capacity);
    return data;
}
