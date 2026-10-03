#include "hud/TeamPanel.hpp"
#include "renderer/EntityRenderer.hpp"
#include <map>
#include <algorithm>
#include <sstream>

void TeamPanel::draw(sf::RenderWindow &window,
                     const GameState &state,
                     const sf::Font &font) const
{
    if (state.teamNames.empty())
        return;

    std::map<std::string, int> counts;
    std::map<std::string, int> maxLevel;
    for (const auto &name : state.teamNames)
        counts[name] = 0;

    for (const auto &[_, player] : state.players) {
        counts[player.teamName]++;
        maxLevel[player.teamName] = std::max(maxLevel[player.teamName], player.level);
    }

    float lineH = 22.f;
    float headerH = 28.f;
    float panelH = headerH + state.teamNames.size() * lineH + 12.f;

    float px = 6.f;
    float py = 120.f;

    sf::RectangleShape bg({PANEL_W, panelH});
    bg.setPosition(px, py);
    bg.setFillColor(sf::Color(8, 10, 20, 185));
    bg.setOutlineColor(sf::Color(70, 75, 120, 210));
    bg.setOutlineThickness(1.f);
    window.draw(bg);

    sf::Text title;
    title.setFont(font);
    title.setString("Equipes");
    title.setCharacterSize(14);
    title.setFillColor(sf::Color(160, 170, 255));
    title.setStyle(sf::Text::Bold);
    title.setPosition(px + 10.f, py + 8.f);
    window.draw(title);

    for (size_t i = 0; i < state.teamNames.size(); ++i) {
        const std::string &team = state.teamNames[i];
        float ry = py + headerH + i * lineH;

        glm::vec3 col = EntityRenderer::teamColor(team, state.teamNames);
        sf::Color teamSf((sf::Uint8)(col.r * 255), (sf::Uint8)(col.g * 255),
                         (sf::Uint8)(col.b * 255));

        sf::RectangleShape bar({4.f, 14.f});
        bar.setPosition(px + 10.f, ry + 2.f);
        bar.setFillColor(teamSf);
        window.draw(bar);

        std::ostringstream oss;
        oss << team << "  x" << counts[team];
        if (maxLevel.count(team))
            oss << "  (max niv." << maxLevel[team] << ")";

        sf::Text line;
        line.setFont(font);
        line.setString(oss.str());
        line.setCharacterSize(12);
        line.setFillColor(sf::Color(200, 205, 225));
        line.setPosition(px + 20.f, ry);
        window.draw(line);
    }
}
