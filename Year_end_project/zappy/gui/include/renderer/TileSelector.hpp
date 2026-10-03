#pragma once

#include <SFML/Graphics.hpp>
#include <glm/glm.hpp>
#include <optional>
#include "state/GameState.hpp"
#include "renderer/Camera.hpp"










class TileSelector {
public:
    TileSelector() = default;

    
    
    bool handleEvent(const sf::Event &ev,
                     const Camera    &camera,
                     const GameState &state,
                     unsigned winW, unsigned winH);

    
    void drawPanel(sf::RenderWindow &win,
                   const GameState  &state,
                   const Camera     &camera,
                   const sf::Font   &font,
                   unsigned winW, unsigned winH) const;

    
    std::optional<std::pair<int,int>> selected() const { return _selected; }

    
    
    void drawHighlight(const GameState &state,
                       const Camera    &camera,
                       float aspect) const;

private:
    
    std::optional<std::pair<int,int>> raycast(
        int mouseX, int mouseY,
        const Camera    &camera,
        const GameState &state,
        unsigned winW, unsigned winH) const;

    std::optional<std::pair<int,int>> _selected;

    static constexpr float TILE_SIZE = 1.0f;
    static constexpr float PANEL_W   = 220.f;
    static constexpr float PANEL_H   = 280.f;
    static constexpr float MARGIN    = 12.f;
};
