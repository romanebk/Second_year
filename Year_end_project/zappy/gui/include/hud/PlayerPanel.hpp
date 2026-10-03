#pragma once

#include <SFML/Graphics.hpp>
#include <optional>
#include "state/GameState.hpp"
#include "renderer/Camera.hpp"
#include "renderer/PlayerMovement.hpp"

class PlayerPanel
{
public:
    void draw(sf::RenderWindow &window,
              const GameState &state,
              int playerId,
              const sf::Font &font,
              unsigned winW, unsigned winH) const;

private:
    static constexpr float PANEL_W = 250.f;
    static constexpr float PANEL_H = 320.f;
};
