/*
** EPITECH PROJECT, 2024
** BatteryModule.hpp
** File description:
** BatteryModule.hpp
*/

#ifndef BATTERYMODULE_HPP
#define BATTERYMODULE_HPP

#include "IModule.hpp"
#include <string>
#include <vector>

class BatteryModule : public Krell::IModule {
public:
    BatteryModule();
    ~BatteryModule();

    void update();
    std::string getName() const;
    std::vector<std::string> getData() const;

private:
    std::string _capacity;
    std::string get_BAT_name(const std::string& root_to_BAT_file, const std::string& begin_of_BAT_name) const;
};

#endif
