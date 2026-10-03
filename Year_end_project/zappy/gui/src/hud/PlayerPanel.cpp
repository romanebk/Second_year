#include "hud/PlayerPanel.hpp"
#include "renderer/EntityRenderer.hpp"
#include <sstream>

void PlayerPanel::draw(sf::RenderWindow &window,
                       const GameState &state,
                       int playerId,
                       const sf::Font &font,
                       unsigned winW, unsigned winH) const
{
    auto it = state.players.find(playerId);
    if (it == state.players.end())
        return;

    const Player &player = it->second;

    float px = (float)winW - PANEL_W - 14.f;
    float py = 130.f;

    sf::RectangleShape bg({PANEL_W, PANEL_H});
    bg.setPosition(px, py);
    bg.setFillColor(sf::Color(8, 10, 22, 215));
    bg.setOutlineColor(sf::Color(255, 210, 80, 210));
    bg.setOutlineThickness(1.5f);
    window.draw(bg);

    auto drawText = [&](const std::string &txt, float x, float y,
                        unsigned size = 13,
                        sf::Color col = sf::Color(210, 215, 235)) {
        sf::Text t;
        t.setFont(font);
        t.setString(txt);
        t.setCharacterSize(size);
        t.setFillColor(col);
        t.setPosition(x, y);
        window.draw(t);
    };

    glm::vec3 col = EntityRenderer::teamColor(player.teamName, state.teamNames);
    sf::Color teamSf((sf::Uint8)(col.r * 255), (sf::Uint8)(col.g * 255),
                     (sf::Uint8)(col.b * 255));

    sf::RectangleShape teamBar({PANEL_W - 20.f, 6.f});
    teamBar.setPosition(px + 10.f, py + 10.f);
    teamBar.setFillColor(teamSf);
    window.draw(teamBar);

    drawText("Joueur #" + std::to_string(player.id), px + 10.f, py + 22.f,
             15, sf::Color(255, 220, 120));
    drawText(player.teamName, px + 10.f, py + 44.f, 13, teamSf);

    sf::RectangleShape sep({PANEL_W - 20.f, 1.f});
    sep.setPosition(px + 10.f, py + 64.f);
    sep.setFillColor(sf::Color(80, 90, 160, 180));
    window.draw(sep);

    std::ostringstream oss;
    oss << "Position   (" << player.x << ", " << player.y << ")";
    drawText(oss.str(), px + 10.f, py + 74.f);
    oss.str("");

    oss << "Orientation " << PlayerMovement::orientationLabel(player.orientation)
        << " (" << player.orientation << ")";
    drawText(oss.str(), px + 10.f, py + 94.f);
    oss.str("");

    oss << "Niveau     " << player.level;
    drawText(oss.str(), px + 10.f, py + 114.f);
    oss.str("");

    drawText("Inventaire", px + 10.f, py + 140.f, 13, sf::Color(160, 175, 255));

    static const char *RES_NAMES[7] = {
        "Food", "Linemate", "Deraumere",
        "Sibur", "Mendiane", "Phiras", "Thystame"
    };
    static const sf::Color RES_COLORS[7] = {
        {243, 204,  38}, {190, 190, 204}, { 38, 140, 242},
        {242, 102,  25}, {191,  38, 217}, { 38, 230, 115},
        {242,  25,  63}
    };

    const int inv[7] = {
        player.inventory.food,      player.inventory.linemate,
        player.inventory.deraumere, player.inventory.sibur,
        player.inventory.mendiane,  player.inventory.phiras,
        player.inventory.thystame
    };

    for (int i = 0; i < 7; ++i) {
        float ry = py + 162.f + i * 20.f;

        sf::CircleShape dot(4.f);
        dot.setFillColor(RES_COLORS[i]);
        dot.setPosition(px + 12.f, ry + 3.f);
        window.draw(dot);

        drawText(RES_NAMES[i], px + 26.f, ry, 12);

        sf::Text val;
        val.setFont(font);
        val.setString(std::to_string(inv[i]));
        val.setCharacterSize(12);
        val.setFillColor(inv[i] > 0 ? RES_COLORS[i] : sf::Color(80, 85, 110));
        auto b = val.getLocalBounds();
        val.setPosition(px + PANEL_W - 14.f - b.width, ry);
        window.draw(val);
    }

    drawText("Shift+Clic / Tab / Echap", px + 10.f, py + PANEL_H - 18.f,
             10, sf::Color(70, 78, 120));
}
