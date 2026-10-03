/*
** EPITECH PROJECT, 2024
** SfmlDisplay.cpp
** File description:
** SfmlDisplay.cpp
*/

#include "Display.hpp"
#include <iostream>

SfmlDisplay::SfmlDisplay() : _window(nullptr) {}

SfmlDisplay::~SfmlDisplay()
{
    close();
}

void SfmlDisplay::init()
{
    _window = new sf::RenderWindow(sf::VideoMode(1200, 700), "MyGKrellm");
    if (!_font.loadFromFile("DS-DIGIT.TTF")) {
        std::cerr << "Warning: Failed to load font." << std::endl;
    }
}

void SfmlDisplay::render(const std::vector<Krell::IModule*>& modules)
{
    if (!_window) return;

    sf::Event event;
    while (_window->pollEvent(event)) {
        if (event.type == sf::Event::Closed || 
           (event.type == sf::Event::KeyPressed && event.key.code == sf::Keyboard::Escape)) {
            _window->close();
        }
    }
    _window->clear(sf::Color::Blue);
    float y = 10.0f;
        
    for (auto& module : modules) {
        sf::RectangleShape rectangle_to_module;
        rectangle_to_module.setSize(sf::Vector2f(550.0f, 30.0f));
        rectangle_to_module.setPosition(30.0f, y - 10);
        rectangle_to_module.setFillColor(sf::Color::White);
        rectangle_to_module.setOutlineThickness(5);
        rectangle_to_module.setOutlineColor(sf::Color::Black);
        _window->draw(rectangle_to_module);
        sf::Text title(module->getName(), _font, 20);
        title.setPosition(100.0f, y);
        title.setFillColor(sf::Color::Black);
        _window->draw(title);
        y += 25.0f;

        for (auto& line : module->getData()) {
            sf::Text text(line, _font, 15);
            text.setPosition(100.0f, y);
            text.setFillColor(sf::Color::Black);
            _window->draw(text);
            y += 20.0f;
        }
        y += 10.0f;
    }
    _window->display();
}

bool SfmlDisplay::isOpen() const 
{
    return _window && _window->isOpen();
}

void SfmlDisplay::close() 
{
    if (_window) {
        if (_window->isOpen()) _window->close();
        delete _window;
        _window = nullptr;
    }
}
