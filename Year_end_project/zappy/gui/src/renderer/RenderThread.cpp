#include "renderer/RenderThread.hpp"
#include "core/ThemeMode.hpp"
#include "hud/HUD.hpp"
#include "hud/PlayerPanel.hpp"
#include "hud/TeamPanel.hpp"
#include <GL/glew.h>
#include <iostream>
#include <sstream>


RenderThread::RenderThread(SharedState &shared, ThemeMode theme)
    : _shared(shared), _theme(theme)
{
    
    for (auto &path : {
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
            "/System/Library/Fonts/Helvetica.ttc" }) {
        if (_font.loadFromFile(path)) { _fontLoaded = true; break; }
    }
}


void RenderThread::run()
{
    
    sf::ContextSettings ctx;
    ctx.depthBits      = 24;
    ctx.stencilBits    = 8;
    ctx.antialiasingLevel = 4;
    ctx.majorVersion   = 3;
    ctx.minorVersion   = 3;
    

    sf::RenderWindow window(
        sf::VideoMode(_winW, _winH),
        std::string("Zappy  –  Mode ") + themeName(_theme),
        sf::Style::Default, ctx
    );
    window.setFramerateLimit(60);
    window.setActive(true);

    
    glewExperimental = GL_TRUE;
    if (GLenum err = glewInit(); err != GLEW_OK) {
        std::cerr << "[render] GLEW : " << glewGetErrorString(err) << "\n";
        return;
    }
    std::cout << "[render] OpenGL " << glGetString(GL_VERSION) << "\n";

    
    Shader tileShader   ("assets/shaders/tile.vert",   "assets/shaders/tile.frag");
    Shader sphereShader ("assets/shaders/sphere.vert", "assets/shaders/sphere.frag");
    Shader glowShader   ("assets/shaders/glow.vert",   "assets/shaders/glow.frag");
    Shader playerShader ("assets/shaders/player.vert", "assets/shaders/player.frag");

    MapRenderer mapRenderer;
    mapRenderer.init(_theme);

    ResourceRenderer resourceRenderer;
    resourceRenderer.init();

    EntityRenderer entityRenderer;
    entityRenderer.init();

    TileSelector   tileSelector;
    PlayerSelector playerSelector;
    PlayerPanel    playerPanel;
    TeamPanel      teamPanel;
    HUD            hud;

    
    glEnable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);

    
    bool cameraInitialized = false;
    sf::Clock frameClock;
    GameState state = _shared.read();

    while (_running && window.isOpen()) {

        
        float dt = std::min(frameClock.restart().asSeconds(), 0.1f);

        
        handleEvents(window, tileSelector, playerSelector, entityRenderer, state);

        
        _camera.update(dt);

        
        state = _shared.read();
        entityRenderer.update(dt, state);
        hud.update(dt, state);

        
        if (!cameraInitialized && state.mapWidth > 0 && state.mapHeight > 0) {
            _camera.setTarget(
                (state.mapWidth  - 1) * 0.5f * MapRenderer::TILE_SIZE,
                (state.mapHeight - 1) * 0.5f * MapRenderer::TILE_SIZE
            );
            cameraInitialized = true;
        }

        
        auto [vpW, vpH] = window.getSize();
        glViewport(0, 0, (GLsizei)vpW, (GLsizei)vpH);
        float aspect = (float)vpW / (float)vpH;

        
        glClearColor(0.06f, 0.07f, 0.13f, 1.f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        
        tileShader.use();
        tileShader.setMat4("view",       _camera.getView());
        tileShader.setMat4("projection", _camera.getProjection(aspect));

        mapRenderer.draw(tileShader, state);
        resourceRenderer.draw(sphereShader, glowShader, state, _camera, aspect);

        int selectedPlayer = playerSelector.selected().value_or(-1);

        playerShader.use();
        playerShader.setMat4("view",       _camera.getView());
        playerShader.setMat4("projection", _camera.getProjection(aspect));
        entityRenderer.draw(playerShader, state, selectedPlayer);

        
        window.pushGLStates();
        drawOverlay(window, state);
        if (_fontLoaded) {
            teamPanel.draw(window, state, _font);
            hud.draw(window, state, entityRenderer, _font, _winW, _winH);
            tileSelector.drawPanel(window, state, _camera, _font, _winW, _winH);
            if (selectedPlayer >= 0)
                playerPanel.draw(window, state, selectedPlayer, _font, _winW, _winH);

            // Appel pour dessiner les labels et animations au-dessus des joueurs
            entityRenderer.drawOverlays(window, state, _camera, _font, _winW, _winH);
        }
        window.popGLStates();

        window.display();
    }
}


void RenderThread::stop() { _running = false; }


void RenderThread::handleEvents(sf::RenderWindow &window,
                                TileSelector     &tileSelector,
                                PlayerSelector   &playerSelector,
                                EntityRenderer   &entityRenderer,
                                const GameState  &state)
{
    sf::Event ev;
    while (window.pollEvent(ev)) {
        if (ev.type == sf::Event::Closed)
            { window.close(); _running = false; }
        if (ev.type == sf::Event::KeyPressed &&
            ev.key.code == sf::Keyboard::Escape) {
            if (playerSelector.selected()) {
                playerSelector.clearSelection();
                continue;
            }
            if (tileSelector.selected()) {
                tileSelector.handleEvent(ev, _camera, state, _winW, _winH);
                continue;
            }
            window.close();
            _running = false;
            continue;
        }
        if (ev.type == sf::Event::Resized) {
            _winW = ev.size.width;
            _winH = ev.size.height;
        }

        
        if (ev.type == sf::Event::LostFocus)
            _camera.resetKeys();

        if (playerSelector.handleEvent(ev, entityRenderer, _camera, state, _winW, _winH))
            continue;

        if (!tileSelector.handleEvent(ev, _camera, state, _winW, _winH))
            _camera.handleEvent(ev);
    }
}




void RenderThread::drawOverlay(sf::RenderWindow &window, const GameState &state)
{
    if (!_fontLoaded) return;

    auto label = [&](const std::string &txt, float x, float y,
                     unsigned sz = 13,
                     sf::Color col = sf::Color(215, 215, 220)) {
        sf::Text t;
        t.setFont(_font);
        t.setString(txt);
        t.setCharacterSize(sz);
        t.setFillColor(col);
        t.setPosition(x, y);
        window.draw(t);
    };

    auto panel = [&](float x, float y, float w, float h) {
        sf::RectangleShape r({w, h});
        r.setPosition(x, y);
        r.setFillColor({8, 10, 20, 185});
        r.setOutlineColor({70, 75, 120, 210});
        r.setOutlineThickness(1.f);
        window.draw(r);
    };

    
    panel(6, 6, 210, 108);
    std::ostringstream oss;

    oss << "Map     " << state.mapWidth << " x " << state.mapHeight;
    label(oss.str(), 14, 12, 14, {180, 200, 255});
    oss.str("");

    oss << "Players " << state.players.size();
    label(oss.str(), 14, 32);
    oss.str("");

    oss << "Teams   " << state.teamNames.size();
    label(oss.str(), 14, 50);
    oss.str("");

    oss << "Eggs    " << state.eggs.size();
    label(oss.str(), 14, 68);
    oss.str("");

    oss << "Time    " << state.timeUnit;
    label(oss.str(), 14, 86);

    
    if (state.gameOver) {
        sf::Text winner;
        winner.setFont(_font);
        winner.setString("  VICTOIRE : " + state.winner + "  ");
        winner.setCharacterSize(40);
        winner.setFillColor({255, 215, 0});
        winner.setOutlineColor({0,0,0});
        winner.setOutlineThickness(3.f);
        auto b = winner.getLocalBounds();
        winner.setPosition((_winW - b.width) * 0.5f, _winH * 0.5f - 30.f);
        window.draw(winner);
    }

    
    static const char* RES_NAME[7] = {
        "food","linemate","deraumere","sibur","mendiane","phiras","thystame"
    };
    static const sf::Color RES_SFML[7] = {
        {243, 204, 38}, {190, 190, 204}, {38, 140, 242},
        {242, 102, 25}, {191, 38, 217}, {38, 230, 115}, {242, 25, 63}
    };

    float ly = (float)_winH - 7 * 20.f - 16.f;
    panel(6, ly - 4, 150, 7 * 20.f + 10.f);
    for (int i = 0; i < 7; ++i) {
        sf::RectangleShape dot({12.f, 12.f});
        dot.setPosition(12.f, ly + i * 20.f + 3.f);
        dot.setFillColor(RES_SFML[i]);
        window.draw(dot);
        label(RES_NAME[i], 30.f, ly + i * 20.f, 12);
    }

    
    static const char* HELP[] = {
        "Camera",
        "LMB drag   rotate",
        "RMB drag   pan",
        "Scroll     zoom",
        "Arrows/ZQSD rotate",
        "+/-        zoom",
        "R          reset",
        "Joueurs",
        "Shift+LMB  select",
        "Tab        suivant",
    };
    static const int HELP_COUNT = 10;
    float hx = (float)_winW - 178.f;
    panel(hx - 4, 6, 175.f, HELP_COUNT * 18.f + 10.f);
    for (int i = 0; i < HELP_COUNT; ++i)
        label(HELP[i], hx + 2, 12 + i * 18.f, 12,
              (i == 0 || i == 7) ? sf::Color(160, 170, 255) : sf::Color(180, 180, 180));
}
