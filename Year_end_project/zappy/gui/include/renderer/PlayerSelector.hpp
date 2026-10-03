#pragma once

#include <SFML/Graphics.hpp>
#include <optional>
#include "state/GameState.hpp"
#include "renderer/Camera.hpp"
#include "renderer/EntityRenderer.hpp"

class PlayerSelector
{
public:
    bool handleEvent(const sf::Event &ev,
                     const EntityRenderer &entities,
                     const Camera         &camera,
                     const GameState      &state,
                     unsigned winW, unsigned winH);

    void clearSelection();
    std::optional<int> selected() const { return _selected; }

private:
    std::optional<int> _selected;
};
