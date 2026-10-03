#pragma once

#include <SFML/Graphics.hpp>
#include "../state/GameState.hpp"

class PlayerPanel {
public:
    void draw(sf::RenderWindow &win, sf::Font &font,
              const GameState &state, int selectedId,
              float x, float y, float w, float h);

    bool handleClick(float mx, float my, float x, float y, float w, float h,
                     const GameState &state, int &outSelectedId);
};
