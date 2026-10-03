/*
** EPITECH PROJECT, 2024
** NcursesDisplay.hpp
** File description:
** NcursesDisplay.hpp
*/

#ifndef NCURSESDISPLAY_HPP
#define NCURSESDISPLAY_HPP

#include "IDisplay.hpp"
#include <ncurses.h>
#include <SFML/Graphics.hpp>

class SfmlDisplay : public Krell::IDisplay
{
public:
    SfmlDisplay();
    ~SfmlDisplay();

    void init();
    void render(const std::vector<Krell::IModule*>& modules);
    bool isOpen() const;
    void close();

private:
    sf::RenderWindow* _window;
    sf::Font _font;
};

class NcursesDisplay : public Krell::IDisplay {
public:
    NcursesDisplay();
    ~NcursesDisplay();

    void init() override;
    void render(const std::vector<Krell::IModule*>& modules);
    bool isOpen() const;
    void close();

private:
    bool _isRunning;
    WINDOW* _window;
};

#endif
