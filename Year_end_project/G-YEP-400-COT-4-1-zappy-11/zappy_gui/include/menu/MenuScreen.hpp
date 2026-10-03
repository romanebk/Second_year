#pragma once

#include <SFML/Graphics.hpp>
#include "../core/ThemeMode.hpp"
#include <array>

class MenuScreen {
public:
    ThemeMode run();

private:
    bool loadFont();
    bool loadTextures();

    void drawBackground(sf::RenderWindow &win, float t);
    void drawCard (sf::RenderWindow &win, int index, bool hovered, bool selected);
    void drawTitle(sf::RenderWindow &win);
    void drawHint (sf::RenderWindow &win);

    static constexpr unsigned WIN_W   = 1280;
    static constexpr unsigned WIN_H   = 720;
    static constexpr float    CARD_W  = 300.f;
    static constexpr float    CARD_H  = 410.f;
    static constexpr float    CARD_GAP = 50.f;
    static constexpr float    CARD_Y  = 170.f;

    static const sf::Color CARD_ACCENT[3];
    static const ThemeMode MODES[3];

    sf::Font _font;
    bool     _fontLoaded = false;

    sf::Texture _texNebula, _texShip;
    std::array<sf::Texture, 3> _texCard;
    bool _texturesLoaded = false;

    float cardX(int i) const;
};
