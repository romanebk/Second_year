#include "TeamPanel.hpp"
#include "../renderer/IslandRenderer.hpp"
#include <sstream>
#include <algorithm>
#include <glm/glm.hpp>

static void lbl(sf::RenderWindow &win, sf::Font &font, const std::string &s,
                float x, float y, unsigned sz,
                sf::Color c = sf::Color(215, 215, 220)) {
    sf::Text t; t.setFont(font); t.setString(s);
    t.setCharacterSize(sz); t.setFillColor(c); t.setPosition(x, y);
    win.draw(t);
}

static void panel(sf::RenderWindow &win, float x, float y, float w, float h) {
    sf::RectangleShape r({w, h});
    r.setPosition(x, y);
    r.setFillColor({8, 10, 20, 190});
    r.setOutlineColor({70, 75, 120, 210});
    r.setOutlineThickness(1.f);
    win.draw(r);
}

void TeamPanel::draw(sf::RenderWindow &win, sf::Font &font,
                     const GameState &state, float x, float y, float w, float h)
{
    panel(win, x, y, w, h);
    lbl(win, font, "TEAMS", x + 8, y + 6, 13, {160, 170, 255});

    float ly = y + 28;
    for (const auto &team : state.teamNames) {
        if (ly > y + h - 20) break;

        int alive = 0, eggs = 0, maxLvl = 0, totalLvl = 0;
        for (auto &[id, p] : state.players) {
            if (p.teamName != team) continue;
            ++alive;
            maxLvl = std::max(maxLvl, p.level);
            totalLvl += p.level;
        }
        for (auto &[eid, e] : state.eggs)
            if (e.teamName == team) ++eggs;

        float avg = alive > 0 ? (float)totalLvl / alive : 0.f;
        int forks = state.teamForkCounts.count(team) ? state.teamForkCounts.at(team) : 0;
        int progress = std::min(100, maxLvl * 12 + alive * 2);

        glm::vec3 tc = IslandRenderer::teamColor(team);
        sf::RectangleShape dot({10, 10});
        dot.setPosition(x + 8, ly + 2);
        dot.setFillColor(sf::Color((sf::Uint8)(tc.r * 255), (sf::Uint8)(tc.g * 255),
                                   (sf::Uint8)(tc.b * 255)));
        win.draw(dot);

        std::ostringstream oss;
        oss << team << "  J:" << alive << "  O:" << eggs
            << "  maxL:" << maxLvl << "  avg:" << (int)avg
            << "  fork:" << forks;
        lbl(win, font, oss.str(), x + 24, ly, 11);

        sf::RectangleShape bar({w - 20, 4});
        bar.setPosition(x + 10, ly + 16);
        bar.setFillColor({30, 35, 50});
        win.draw(bar);
        sf::RectangleShape fill({(w - 20) * progress / 100.f, 4});
        fill.setPosition(x + 10, ly + 16);
        fill.setFillColor({80, 180, 255, 200});
        win.draw(fill);

        ly += 28;
    }
}

bool TeamPanel::handleClick(float mx, float my, float x, float y, float w, float h,
                            const GameState &state, std::string &outFollowTeam)
{
    if (mx < x || mx > x + w || my < y || my > y + h) return false;
    float ly = y + 28;
    for (const auto &team : state.teamNames) {
        if (ly > y + h - 20) break;
        if (my >= ly && my < ly + 24) { outFollowTeam = team; return true; }
        ly += 28;
    }
    return true;
}
