#pragma once

#include <SFML/Graphics.hpp>
#include "state/GameState.hpp"

class TeamPanel
{
public:
    void draw(sf::RenderWindow &window,
              const GameState &state,
              const sf::Font &font) const;

private:
    static constexpr float PANEL_W = 210.f;
};
