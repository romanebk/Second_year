#pragma once

#include <SFML/Graphics.hpp>
#include <deque>
#include <string>
#include "state/GameState.hpp"
#include "renderer/EntityRenderer.hpp"
#include "renderer/PlayerMovement.hpp"

struct HudEvent
{
    std::string text;
    float       ttl = 4.f;
    sf::Color   color {220, 220, 230};
};

class HUD
{
public:
    void update(float dt, const GameState &state);
    void draw(sf::RenderWindow &window,
              const GameState &state,
              const EntityRenderer &entities,
              const sf::Font &font,
              unsigned winW, unsigned winH) const;

private:
    void drawMinimap(sf::RenderWindow &window,
                     const GameState &state,
                     const EntityRenderer &entities,
                     unsigned winW, unsigned winH) const;

    void drawBroadcastLog(sf::RenderWindow &window,
                          const sf::Font &font,
                          unsigned winW) const;

    void drawEvents(sf::RenderWindow &window,
                    const sf::Font &font,
                    unsigned winW) const;

    std::deque<std::string> _broadcasts;
    std::deque<HudEvent>    _events;

    int _lastBroadcastId = -1;
    int _lastExpulsion   = -1;
    int _lastFork        = -1;
};
