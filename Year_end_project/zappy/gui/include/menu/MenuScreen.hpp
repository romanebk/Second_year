#pragma once

#include <SFML/Graphics.hpp>
#include "core/ThemeMode.hpp"








class MenuScreen {
public:
    ThemeMode run();

private:
    bool loadFont();
    void drawCard (sf::RenderWindow &win, int index, bool hovered, bool selected);
    void drawTitle(sf::RenderWindow &win);
    void drawHint (sf::RenderWindow &win);

    static constexpr unsigned WIN_W   = 960;
    static constexpr unsigned WIN_H   = 560;
    static constexpr float    CARD_W  = 220.f;
    static constexpr float    CARD_H  = 300.f;
    static constexpr float    CARD_GAP = 50.f;
    static constexpr float    CARD_Y  = 140.f;

    
    static const sf::Color CARD_ACCENT[3];
    static const ThemeMode MODES[3];

    sf::Font _font;
    bool     _fontLoaded = false;

    float cardX(int i) const;
};
