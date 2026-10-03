/*
** EPITECH PROJECT, 2024
** main.cpp
** File description:
** main.cpp
*/

#include <iostream>
#include <string>
#include "Core.hpp"
#include <cstring>
#include "Display.hpp"
#include "Module/HostnameModule.hpp"
#include "Module/KernelModule.hpp"
#include "Module/DateModule.hpp"
#include "Module/BatteryModule.hpp"
#include "Module/CpuModule.hpp"
#include "Module/RamModule.hpp"

int main(int argc, char** argv)
{
    if (argc < 2 || strcmp(argv[1], "--help") == 0 || strcmp(argv[1], "-h") == 0) {
        std::cerr << "Usage: ./MyGKrellm [--ncurses|-n|--sfml|-s]" << std::endl;
        return 84;
    }
    std::string argument = argv[1];
    Krell::IDisplay* display = nullptr;

    if (argument == "--ncurses" || argument == "-n") {
        display = new NcursesDisplay();
    } else if (argument == "--sfml" || argument == "-s") {
        display = new SfmlDisplay();
    } else {
        std::cerr << "Error: Unknown mode. Use '--ncurses' or '--sfml'." << std::endl;
        return 84;
    }
    Core engine(display);
    engine.addModule(new HostnameModule());
    engine.addModule(new KernelModule());
    engine.addModule(new DateModule());
    engine.addModule(new BatteryModule());
    engine.addModule(new CpuModule());
    engine.addModule(new RamModule());
    
    engine.run();
    delete display;
    return 0;
}
