#include "RenderThread.hpp"
#include "ThemeMode.hpp"
#include "PlanetRenderer.hpp"
#include "StarfieldRenderer.hpp"
#include "../network/CommandQueue.hpp"
#include "../core/BackgroundMusic.hpp"
#include <GL/glew.h>
#include <iostream>
#include <exception>
#include <cmath>
#include <glm/gtc/matrix_transform.hpp>

RenderThread::RenderThread(SharedState &shared, ThemeMode theme, CommandQueue *cmdQueue,
                           std::function<void()> requestMenuRestart)
    : _shared(shared), _theme(theme), _cmdQueue(cmdQueue),
      _requestMenuRestart(std::move(requestMenuRestart))
{
    _fontLoaded = _hud.loadFont();
}

void RenderThread::run()
{
    try {
        runImpl();
    } catch (const std::exception &e) {
        std::cerr << "[render] exception fatale : " << e.what() << "\n";
        _running = false;
    } catch (...) {
        std::cerr << "[render] exception fatale inconnue\n";
        _running = false;
    }
}

void RenderThread::runImpl()
{
    sf::ContextSettings ctx;
    ctx.depthBits = 24; ctx.stencilBits = 8;
    ctx.antialiasingLevel = 4; ctx.majorVersion = 3; ctx.minorVersion = 3;

    sf::RenderWindow window(
        sf::VideoMode(_winW, _winH),
        std::string("Zappy  –  Mode ") + themeName(_theme),
        sf::Style::Default, ctx);
    window.setFramerateLimit(60);
    window.setActive(true);
    window.setKeyRepeatEnabled(false);

    glewExperimental = GL_TRUE;
    if (GLenum err = glewInit(); err != GLEW_OK) {
        std::cerr << "[render] GLEW : " << glewGetErrorString(err) << "\n";
        return;
    }

    Shader sphereShader("assets/shaders/sphere_instanced.vert", "assets/shaders/sphere_instanced.frag");
    Shader planetShader("assets/shaders/planet.vert", "assets/shaders/planet.frag");
    Shader starShader("assets/shaders/star.vert", "assets/shaders/star.frag");
    Shader shootingShader("assets/shaders/shooting_star.vert", "assets/shaders/shooting_star.frag");
    Shader playerShader("assets/shaders/player_anim.vert", "assets/shaders/player_anim.frag");

    ResourceRenderer resourceRenderer;
    resourceRenderer.init();
    IslandRenderer islandRenderer;
    islandRenderer.init(_theme);
    PlanetRenderer planetRenderer;
    planetRenderer.init();
    StarfieldRenderer starfieldRenderer;
    starfieldRenderer.init(800, 200.f, 4);

    glEnable(GL_DEPTH_TEST);
    glEnable(GL_CULL_FACE);
    glCullFace(GL_BACK);

    _camera.setWindowSize(_winW, _winH);
    _camera.setStartPosition(glm::vec3(0.f, 1.5f, 8.f), -90.f, -10.f);
    _camera.setTarget(0.f, 0.f);
    _camera.setMode(Camera::Mode::Orbital, window);

    sf::Clock frameClock;
    sf::Clock fpsTimer;
    GameState state = _shared.read();
    bool cameraTargetInitialized = false;

    while (_running && window.isOpen()) {
        float rawDt = std::min(frameClock.restart().asSeconds(), 0.1f);
        float dt = _ui.paused ? 0.f : rawDt;

        _frameCount++;
        if (fpsTimer.getElapsedTime().asSeconds() >= 1.f) {
            _fps = (float)_frameCount;
            _frameCount = 0;
            fpsTimer.restart();
        }

        handleEvents(window, state);
        _camera.update(dt);
        islandRenderer.update(dt);

        state = _shared.read();
        _hud.update(dt, state, _ui);

        if (!cameraTargetInitialized && state.mapWidth > 0 && state.mapHeight > 0) {
            float halfW = (state.mapWidth - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
            float halfH = (state.mapHeight - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
            float worldRadius = std::sqrt(halfW * halfW + halfH * halfH)
                              + IslandRenderer::ISLAND_SPACING * 1.5f;
            _camera.frameMap(0.f, 0.f, worldRadius);
            if (_ui.baseTimeUnit <= 0) _ui.baseTimeUnit = state.timeUnit;
            cameraTargetInitialized = true;
        }

        const float offX = -(state.mapWidth - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
        const float offZ = -(state.mapHeight - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;

        if (_ui.followPlayerId >= 0 && state.players.count(_ui.followPlayerId)) {
            const Player &fp = state.players.at(_ui.followPlayerId);
            _camera.followTarget(offX + fp.x * IslandRenderer::ISLAND_SPACING,
                                 offZ + fp.y * IslandRenderer::ISLAND_SPACING, dt);
        } else if (! _ui.followTeam.empty()) {
            float cx = 0, cz = 0; int n = 0;
            for (auto &[id, p] : state.players) {
                if (p.teamName != _ui.followTeam) continue;
                cx += offX + p.x * IslandRenderer::ISLAND_SPACING;
                cz += offZ + p.y * IslandRenderer::ISLAND_SPACING;
                ++n;
            }
            if (n > 0) _camera.followTarget(cx / n, cz / n, dt);
        }

        auto [vpW, vpH] = window.getSize();
        glViewport(0, 0, (GLsizei)vpW, (GLsizei)vpH);
        float aspect = (float)vpW / (float)vpH;

        glClearColor(0.04f, 0.05f, 0.10f, 1.f);
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        starfieldRenderer.draw(starShader, shootingShader, _camera, aspect);
        planetRenderer.draw(planetShader, _camera, aspect, dt);

        islandRenderer.draw(sphereShader, sphereShader, playerShader, state,
                            _camera, aspect, resourceRenderer,
                            _ui.filters, &_visibleTiles);

        RenderStats stats;
        stats.fps = _fps;
        stats.tilesRendered = _visibleTiles;
        stats.playerCount = (int)state.players.size();
        stats.eventsPerSec = state.eventsPerSecond;
        stats.connected = state.serverConnected;
        stats.pingMs = state.serverConnected ? 16.f : 999.f;

        window.pushGLStates();
        _hud.draw(window, state, _ui, _camera, stats, vpW, vpH);
        window.popGLStates();

        window.display();
    }

    _camera.captureMouse(window, false);
}

void RenderThread::stop() { _running = false; }

void RenderThread::handleEvents(sf::RenderWindow &window, GameState &state)
{
    auto sendCmd = [this](const std::string &cmd) {
        if (_cmdQueue) _cmdQueue->push(cmd);
    };

    sf::Event ev;
    while (window.pollEvent(ev)) {
        if (ev.type == sf::Event::Closed) {
            window.close(); _running = false;
        }

        if (_hud.handleEvent(ev, state, _ui, _camera, _winW, _winH, sendCmd))
            continue;

        if (ev.type == sf::Event::KeyPressed && ev.key.code == sf::Keyboard::Escape) {
            if (_camera.getMode() == Camera::Mode::FreeFly && _camera.isMouseCaptured())
                _camera.captureMouse(window, false);
            else { window.close(); _running = false; }
        }

        if (ev.type == sf::Event::KeyPressed && ev.key.code == sf::Keyboard::N) {
            window.close();
            _running = false;
            if (_requestMenuRestart)
                _requestMenuRestart();
        }

        if (ev.type == sf::Event::KeyPressed)
            BackgroundMusic::onKeyPressed(ev.key.code);

        if (ev.type == sf::Event::MouseButtonPressed &&
            _camera.getMode() == Camera::Mode::FreeFly && !_camera.isMouseCaptured())
            _camera.captureMouse(window, true);

        if (ev.type == sf::Event::Resized) {
            _winW = ev.size.width; _winH = ev.size.height;
            _camera.setWindowSize(_winW, _winH);
        }

        if (ev.type == sf::Event::LostFocus)
            _camera.resetKeys();

        _camera.handleEvent(ev, window);
    }
}
