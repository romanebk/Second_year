#include "renderer/TileSelector.hpp"
#include "renderer/EntityRenderer.hpp"
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <GL/glew.h>
#include <cmath>
#include <sstream>










std::optional<std::pair<int,int>> TileSelector::raycast(
    int mouseX, int mouseY,
    const Camera    &camera,
    const GameState &state,
    unsigned winW, unsigned winH) const
{
    if (state.mapWidth == 0 || state.mapHeight == 0)
        return std::nullopt;

    float aspect = (float)winW / (float)winH;

    
    float ndcX =  (2.f * mouseX) / (float)winW - 1.f;
    float ndcY = -(2.f * mouseY) / (float)winH + 1.f;

    
    glm::mat4 invVP = glm::inverse(
        camera.getProjection(aspect) * camera.getView()
    );

    glm::vec4 nearH = invVP * glm::vec4(ndcX, ndcY, -1.f, 1.f);
    glm::vec4 farH  = invVP * glm::vec4(ndcX, ndcY,  1.f, 1.f);

    glm::vec3 nearW = glm::vec3(nearH) / nearH.w;
    glm::vec3 farW  = glm::vec3(farH)  / farH.w;

    glm::vec3 dir = glm::normalize(farW - nearW);

    
    const float PLANE_Y = 0.5f;
    if (fabsf(dir.y) < 1e-6f)
        return std::nullopt;   

    float t = (PLANE_Y - nearW.y) / dir.y;
    if (t < 0.f)
        return std::nullopt;   

    glm::vec3 hit = nearW + t * dir;

    
    float offsetX = -(state.mapWidth  - 1) * 0.5f * TILE_SIZE;
    float offsetZ = -(state.mapHeight - 1) * 0.5f * TILE_SIZE;

    int col = (int)floorf((hit.x - offsetX + TILE_SIZE * 0.5f) / TILE_SIZE);
    int row = (int)floorf((hit.z - offsetZ + TILE_SIZE * 0.5f) / TILE_SIZE);

    if (col < 0 || col >= state.mapWidth ||
        row < 0 || row >= state.mapHeight)
        return std::nullopt;

    return std::make_pair(col, row);
}


bool TileSelector::handleEvent(const sf::Event &ev,
                                const Camera    &camera,
                                const GameState &state,
                                unsigned winW, unsigned winH)
{
    
    if (ev.type == sf::Event::MouseButtonPressed &&
        ev.mouseButton.button == sf::Mouse::Left)
    {
        auto tile = raycast(ev.mouseButton.x, ev.mouseButton.y,
                            camera, state, winW, winH);
        if (tile) {
            _selected = tile;
            return true;
        } else {
            _selected = std::nullopt;
            return false;
        }
    }

    
    if (ev.type == sf::Event::KeyPressed && _selected) {
        auto [col, row] = *_selected;
        switch (ev.key.code) {
        case sf::Keyboard::Left:
            col = (col - 1 + state.mapWidth) % state.mapWidth;
            _selected = {col, row};
            return true;
        case sf::Keyboard::Right:
            col = (col + 1) % state.mapWidth;
            _selected = {col, row};
            return true;
        case sf::Keyboard::Up:
            row = (row - 1 + state.mapHeight) % state.mapHeight;
            _selected = {col, row};
            return true;
        case sf::Keyboard::Down:
            row = (row + 1) % state.mapHeight;
            _selected = {col, row};
            return true;
        case sf::Keyboard::Escape:
            _selected = std::nullopt;
            return true;
        default:
            break;
        }
    }

    return false;
}




void TileSelector::drawPanel(sf::RenderWindow &win,
                              const GameState  &state,
                              const Camera     &camera,
                              const sf::Font   &font,
                              unsigned winW, unsigned winH) const
{
    if (!_selected) return;

    auto [col, row] = *_selected;

    
    float aspect  = (float)winW / (float)winH;
    float offsetX = -(state.mapWidth  - 1) * 0.5f * TILE_SIZE;
    float offsetZ = -(state.mapHeight - 1) * 0.5f * TILE_SIZE;

    glm::vec4 worldPos(
        offsetX + col * TILE_SIZE,
        0.5f,   
        offsetZ + row * TILE_SIZE,
        1.f
    );

    glm::mat4 vp  = camera.getProjection(aspect) * camera.getView();
    glm::vec4 clip = vp * worldPos;

    
    glm::vec3 ndc = glm::vec3(clip) / clip.w;

    
    float sx = ( ndc.x * 0.5f + 0.5f) * (float)winW;
    float sy = (-ndc.y * 0.5f + 0.5f) * (float)winH;

    
    float px = sx + 16.f;
    float py = sy + 16.f;

    
    if (px + PANEL_W + MARGIN > (float)winW) px = sx - PANEL_W - 16.f;
    if (py + PANEL_H + MARGIN > (float)winH) py = sy - PANEL_H - 16.f;
    if (px < MARGIN) px = MARGIN;
    if (py < MARGIN) py = MARGIN;

    sf::RectangleShape bg({PANEL_W, PANEL_H});
    bg.setPosition(px, py);
    bg.setFillColor(sf::Color(8, 10, 22, 210));
    bg.setOutlineColor(sf::Color(100, 120, 220, 200));
    bg.setOutlineThickness(1.5f);
    win.draw(bg);

    
    {
        sf::Text title;
        title.setFont(font);
        title.setString("Tuile (" + std::to_string(col) +
                        ", " + std::to_string(row) + ")");
        title.setCharacterSize(14);
        title.setFillColor(sf::Color(160, 175, 255));
        title.setStyle(sf::Text::Bold);
        title.setPosition(px + 10.f, py + 8.f);
        win.draw(title);
    }

    
    sf::RectangleShape sep({PANEL_W - 20.f, 1.f});
    sep.setPosition(px + 10.f, py + 28.f);
    sep.setFillColor(sf::Color(80, 90, 160, 180));
    win.draw(sep);

    
    static const char* RES_NAMES[7] = {
        "Food", "Linemate", "Deraumere",
        "Sibur", "Mendiane", "Phiras", "Thystame"
    };
    static const sf::Color RES_COLORS[7] = {
        {243, 204,  38}, {190, 190, 204}, { 38, 140, 242},
        {242, 102,  25}, {191,  38, 217}, { 38, 230, 115},
        {242,  25,  63}
    };

    
    TileResources res;
    auto it = state.tiles.find({col, row});
    if (it != state.tiles.end())
        res = it->second.resources;

    const int vals[7] = {
        res.food, res.linemate, res.deraumere, res.sibur,
        res.mendiane, res.phiras, res.thystame
    };

    for (int i = 0; i < 7; ++i) {
        float ry = py + 38.f + i * 22.f;

        
        sf::CircleShape dot(5.f);
        dot.setFillColor(RES_COLORS[i]);
        dot.setPosition(px + 12.f, ry + 4.f);
        win.draw(dot);

        
        sf::Text nameT;
        nameT.setFont(font);
        nameT.setString(RES_NAMES[i]);
        nameT.setCharacterSize(13);
        nameT.setFillColor(sf::Color(200, 205, 225));
        nameT.setPosition(px + 28.f, ry);
        win.draw(nameT);

        
        sf::Text valT;
        valT.setFont(font);
        valT.setString(std::to_string(vals[i]));
        valT.setCharacterSize(13);
        valT.setFillColor(vals[i] > 0
            ? RES_COLORS[i]
            : sf::Color(80, 85, 110));
        auto b = valT.getLocalBounds();
        valT.setPosition(px + PANEL_W - 14.f - b.width, ry);
        win.draw(valT);
    }

    float playerY = py + 38.f + 7 * 22.f + 6.f;
    sf::RectangleShape sep2({PANEL_W - 20.f, 1.f});
    sep2.setPosition(px + 10.f, playerY);
    sep2.setFillColor(sf::Color(80, 90, 160, 180));
    win.draw(sep2);

    sf::Text playersTitle;
    playersTitle.setFont(font);
    playersTitle.setString("Joueurs sur la tuile");
    playersTitle.setCharacterSize(12);
    playersTitle.setFillColor(sf::Color(160, 175, 255));
    playersTitle.setPosition(px + 10.f, playerY + 6.f);
    win.draw(playersTitle);

    int count = 0;
    for (const auto &[id, player] : state.players) {
        if (player.x != col || player.y != row)
            continue;

        glm::vec3 tcol = EntityRenderer::teamColor(player.teamName, state.teamNames);
        sf::Color teamSf((sf::Uint8)(tcol.r * 255), (sf::Uint8)(tcol.g * 255),
                         (sf::Uint8)(tcol.b * 255));

        float ly = playerY + 24.f + count * 18.f;

        sf::RectangleShape bar({3.f, 12.f});
        bar.setPosition(px + 12.f, ly + 2.f);
        bar.setFillColor(teamSf);
        win.draw(bar);

        sf::Text line;
        line.setFont(font);
        line.setString("#" + std::to_string(id) + "  niv." +
                       std::to_string(player.level) + "  " + player.teamName);
        line.setCharacterSize(11);
        line.setFillColor(sf::Color(200, 205, 225));
        line.setPosition(px + 20.f, ly);
        win.draw(line);
        ++count;
    }

    if (count == 0) {
        sf::Text none;
        none.setFont(font);
        none.setString("(aucun)");
        none.setCharacterSize(11);
        none.setFillColor(sf::Color(80, 85, 110));
        none.setPosition(px + 12.f, playerY + 24.f);
        win.draw(none);
    }

    
    sf::Text hint;
    hint.setFont(font);
    hint.setString("Fleches: naviguer   Echap: fermer");
    hint.setCharacterSize(10);
    hint.setFillColor(sf::Color(70, 78, 120));
    hint.setPosition(px + 8.f, py + PANEL_H - 16.f);
    win.draw(hint);
}
