#include "hud/HUD.hpp"
#include <sstream>

void HUD::update(float dt, const GameState &state)
{
    if (state.lastBroadcast.first >= 0 &&
        state.lastBroadcast.first != _lastBroadcastId)
    {
        _lastBroadcastId = state.lastBroadcast.first;
        std::ostringstream oss;
        oss << "#" << state.lastBroadcast.first << " : "
            << state.lastBroadcast.second;
        _broadcasts.push_front(oss.str());
        while (_broadcasts.size() > 5)
            _broadcasts.pop_back();
    }

    if (state.lastExpulsion >= 0 && state.lastExpulsion != _lastExpulsion) {
        _lastExpulsion = state.lastExpulsion;
        _events.push_back({
            "Expulsion du joueur #" + std::to_string(state.lastExpulsion),
            4.f, {255, 120, 80}
        });
    }

    if (state.lastFork >= 0 && state.lastFork != _lastFork) {
        _lastFork = state.lastFork;
        _events.push_back({
            "Fork du joueur #" + std::to_string(state.lastFork),
            4.f, {120, 220, 255}
        });
    }

    for (auto &ev : _events)
        ev.ttl -= dt;
    while (!_events.empty() && _events.front().ttl <= 0.f)
        _events.pop_front();
}

void HUD::drawMinimap(sf::RenderWindow &window,
                      const GameState &state,
                      const EntityRenderer &entities,
                      unsigned winW, unsigned winH) const
{
    if (state.mapWidth == 0 || state.mapHeight == 0)
        return;

    const float mapW = 160.f;
    const float mapH = mapW * state.mapHeight / (float)state.mapWidth;
    const float px   = (float)winW - mapW - 14.f;
    const float py   = (float)winH - mapH - 14.f;

    sf::RectangleShape bg({mapW, mapH});
    bg.setPosition(px, py);
    bg.setFillColor(sf::Color(5, 8, 18, 200));
    bg.setOutlineColor(sf::Color(70, 80, 140, 200));
    bg.setOutlineThickness(1.f);
    window.draw(bg);

    auto toMini = [&](float gx, float gy) -> sf::Vector2f {
        return {
            px + (gx / (float)(state.mapWidth  - 1 > 0 ? state.mapWidth  - 1 : 1)) * (mapW - 4.f) + 2.f,
            py + (gy / (float)(state.mapHeight - 1 > 0 ? state.mapHeight - 1 : 1)) * (mapH - 4.f) + 2.f
        };
    };

    for (const auto &[id, player] : state.players) {
        const PlayerVisualState *vs = entities.movement().get(id);
        if (!vs)
            continue;

        glm::vec3 col = EntityRenderer::teamColor(player.teamName, state.teamNames);
        sf::Color c((sf::Uint8)(col.r * 255), (sf::Uint8)(col.g * 255),
                    (sf::Uint8)(col.b * 255));

        sf::CircleShape dot(3.f);
        dot.setFillColor(c);
        sf::Vector2f p = toMini(vs->x, vs->y);
        dot.setPosition(p.x - 3.f, p.y - 3.f);
        window.draw(dot);
    }
}

void HUD::drawBroadcastLog(sf::RenderWindow &window,
                           const sf::Font &font,
                           unsigned winW) const
{
    if (_broadcasts.empty())
        return;

    float panelW = 320.f;
    float panelH = 20.f + _broadcasts.size() * 18.f;
    float px = (float)winW * 0.5f - panelW * 0.5f;
    float py = 8.f;

    sf::RectangleShape bg({panelW, panelH});
    bg.setPosition(px, py);
    bg.setFillColor(sf::Color(8, 10, 22, 170));
    bg.setOutlineColor(sf::Color(100, 120, 200, 160));
    bg.setOutlineThickness(1.f);
    window.draw(bg);

    for (size_t i = 0; i < _broadcasts.size(); ++i) {
        sf::Text t;
        t.setFont(font);
        t.setString(_broadcasts[i]);
        t.setCharacterSize(11);
        t.setFillColor(sf::Color(200, 210, 255));
        t.setPosition(px + 8.f, py + 6.f + i * 18.f);
        window.draw(t);
    }
}

void HUD::drawEvents(sf::RenderWindow &window,
                     const sf::Font &font,
                     unsigned winW) const
{
    float y = 150.f;
    for (const auto &ev : _events) {
        sf::Text t;
        t.setFont(font);
        t.setString(ev.text);
        t.setCharacterSize(13);
        t.setFillColor(ev.color);
        t.setPosition((float)winW * 0.5f - 120.f, y);
        window.draw(t);
        y += 22.f;
    }
}

void HUD::draw(sf::RenderWindow &window,
               const GameState &state,
               const EntityRenderer &entities,
               const sf::Font &font,
               unsigned winW, unsigned winH) const
{
    drawMinimap(window, state, entities, winW, winH);
    drawBroadcastLog(window, font, winW);
    drawEvents(window, font, winW);
}
