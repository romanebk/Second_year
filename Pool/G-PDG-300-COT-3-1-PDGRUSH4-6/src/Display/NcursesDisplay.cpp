/*
** EPITECH PROJECT, 2024
** NcursesDisplay.cpp
** File description:
** NcursesDisplay.cpp
*/

#include "../include/Display.hpp"
#include <iostream>
#include <unistd.h>

NcursesDisplay::NcursesDisplay() : _isRunning(true), _window(nullptr) {}

NcursesDisplay::~NcursesDisplay()
{
    close();
}

void NcursesDisplay::init()
{
    _window = initscr();
    noecho();
    curs_set(0);
    keypad(stdscr, TRUE);
    nodelay(stdscr, TRUE);
    timeout(1000);
    _isRunning = true;
}

void NcursesDisplay::render(const std::vector<Krell::IModule*>& modules)
{
    int ch = getch();
    if (ch == 'q' || ch == 'Q'|| ch == 27) {
        _isRunning = false;
        return;
    }

    clear();
    int row = 0;
    for (const auto& module : modules) {
        mvprintw(row++, 2, "Module: %s", module->getName().c_str());
        std::vector<std::string> data = module->getData();
        for (const auto& line : data) {
            mvprintw(row++, 4, "%s", line.c_str());
        }
        row++;
    }
    refresh();
}

bool NcursesDisplay::isOpen() const
{
        return _isRunning;
}

void NcursesDisplay::close()
{
        if (_window) {
            endwin();
            _window = nullptr;
        }
        _isRunning = false;
}
