#pragma once

#include <SFML/Graphics.hpp>
#include <atomic>
#include "core/SharedState.hpp"
#include "core/ThemeMode.hpp"
#include "renderer/Camera.hpp"
#include "renderer/MapRenderer.hpp"
#include "renderer/ResourceRenderer.hpp"
#include "renderer/EntityRenderer.hpp"
#include "renderer/PlayerSelector.hpp"
#include "renderer/TileSelector.hpp"
#include "renderer/Shader.hpp"

class RenderThread {
public:
    RenderThread(SharedState &shared, ThemeMode theme);

    void run();
    void stop();

private:
    void handleEvents(sf::RenderWindow &window,
                      TileSelector     &tileSelector,
                      PlayerSelector   &playerSelector,
                      EntityRenderer   &entityRenderer,
                      const GameState  &state);
    void drawOverlay (sf::RenderWindow &window, const GameState &state);

    SharedState      &_shared;
    ThemeMode         _theme;
    std::atomic<bool> _running { true };

    Camera      _camera;
    sf::Font    _font;
    bool        _fontLoaded = false;

    unsigned int _winW = 1280;
    unsigned int _winH = 720;
};
