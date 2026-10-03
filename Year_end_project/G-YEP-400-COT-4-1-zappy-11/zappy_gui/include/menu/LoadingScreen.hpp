#pragma once

#include <SFML/Graphics.hpp>
#include "../core/SharedState.hpp"

















class LoadingScreen {
public:
    
    
    bool run(SharedState &shared);

private:
    bool loadFont();
    void drawBackground(sf::RenderWindow &win, float t);
    void drawSpinner(sf::RenderWindow &win, sf::Vector2f center, float radius, float t);
    void drawProgress(sf::RenderWindow &win, float ratio, const std::string &label);

    sf::Font _font;
    bool     _fontLoaded = false;

    sf::Texture _texNebula;
    bool        _texturesLoaded = false;

    static constexpr unsigned WIN_W = 1280;
    static constexpr unsigned WIN_H = 760;

    
    static constexpr float STABILITY_DELAY = 0.8f;

    
    
    
    static constexpr float MAX_WAIT = 12.f;
};
