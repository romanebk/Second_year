#pragma once

#include <SFML/Graphics.hpp>
#include <atomic>
#include <functional>
#include "../core/SharedState.hpp"
#include "../core/ThemeMode.hpp"
#include "../hud/HUD.hpp"
#include "../hud/UiState.hpp"
#include "Camera.hpp"
#include "IslandRenderer.hpp"
#include "ResourceRenderer.hpp"
#include "Shader.hpp"

class CommandQueue;

class RenderThread {
public:
    RenderThread(SharedState &shared, ThemeMode theme,
                 CommandQueue *cmdQueue = nullptr,
                 std::function<void()> requestMenuRestart = nullptr);

    void run();
    void stop();

private:
    void runImpl();
    void handleEvents(sf::RenderWindow &window, GameState &state);

    SharedState      &_shared;
    ThemeMode         _theme;
    CommandQueue     *_cmdQueue = nullptr;
    std::function<void()> _requestMenuRestart;
    std::atomic<bool> _running { true };

    Camera      _camera;
    HUD         _hud;
    UiState     _ui;
    sf::Font    _font;
    bool        _fontLoaded = false;

    unsigned int _winW = 1280;
    unsigned int _winH = 720;

    float _fps = 0.f;
    int   _visibleTiles = 0;
    int   _frameCount = 0;
};
