#pragma once

#include <SFML/Graphics.hpp>
#include <functional>
#include "../state/GameState.hpp"
#include "UiState.hpp"
#include "PlayerPanel.hpp"
#include "TeamPanel.hpp"
#include "../renderer/Camera.hpp"

struct RenderStats {
    float fps = 0.f;
    int   tilesRendered = 0;
    int   playerCount = 0;
    float eventsPerSec = 0.f;
    float pingMs = 0.f;
    bool  connected = true;
};

class HUD {
public:
    bool loadFont();

    void update(float dt, GameState &state, UiState &ui);

    bool handleEvent(const sf::Event &ev, GameState &state, UiState &ui,
                     const Camera &camera, unsigned winW, unsigned winH,
                     std::function<void(const std::string &)> sendCmd);

    void draw(sf::RenderWindow &win, const GameState &state, UiState &ui,
              const Camera &camera, const RenderStats &stats,
              unsigned winW, unsigned winH);

    bool isMouseOverHud(float mx, float my, unsigned winW, unsigned winH) const;

private:
    void drawPanel(sf::RenderWindow &win, float x, float y, float w, float h,
                   sf::Color fill = {8, 10, 20, 190});
    void drawText(sf::RenderWindow &win, const std::string &txt,
                  float x, float y, unsigned sz = 13,
                  sf::Color col = {215, 215, 220});

    void drawEventFeed(sf::RenderWindow &win, const GameState &state,
                       float x, float y, float w, float h);
    void drawTileInspector(sf::RenderWindow &win, const GameState &state,
                           const UiState &ui, float x, float y, float w, float h);
    void drawMinimap(sf::RenderWindow &win, const GameState &state,
                     const UiState &ui, const Camera &camera,
                     float x, float y, float size);
    void drawScoreboard(sf::RenderWindow &win, const GameState &state,
                        float x, float y, float w, float h);
    void drawTimeControl(sf::RenderWindow &win, const GameState &state,
                         UiState &ui, float x, float y, float w, float h,
                         std::function<void(const std::string &)> sendCmd);
    void drawDebugPanel(sf::RenderWindow &win, const RenderStats &stats,
                        float x, float y, float w, float h);
    void drawFilters(sf::RenderWindow &win, UiState &ui,
                     float x, float y, float w, float h);
    void drawEndgame(sf::RenderWindow &win, const GameState &state,
                     UiState &ui, unsigned winW, unsigned winH);
    void drawConnectionStatus(sf::RenderWindow &win, const RenderStats &stats,
                              float x, float y);
    void drawSpectatorHelp(sf::RenderWindow &win, const UiState &ui,
                           float x, float y);

    static const char *eventLabel(GameEventType t);
    static const char *orientLabel(int o);
    static const char *activityLabel(PlayerActivity a);
    static const char *resName(int r);

    sf::Font     _font;
    bool         _fontLoaded = false;
    PlayerPanel  _playerPanel;
    TeamPanel    _teamPanel;

    float _timeCtrlY = 120.f;
    float _filterY   = 200.f;
};
