#include "HUD.hpp"
#include "../renderer/IslandRenderer.hpp"
#include "../core/BroadcastCodec.hpp"
#include <glm/glm.hpp>
#include <sstream>
#include <cmath>
#include <algorithm>
#include <vector>

bool HUD::loadFont() {
    for (auto &path : {
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
            "/System/Library/Fonts/Helvetica.ttc" }) {
        if (_font.loadFromFile(path)) { _fontLoaded = true; return true; }
    }
    return false;
}

void HUD::update(float dt, GameState &state, UiState &ui) {
    state.tickSim(dt);
    if (state.gameOver) ui.endgameAnimTime += dt;

    ui.playerIdList.clear();
    for (auto &[id, p] : state.players)
        ui.playerIdList.push_back(id);
    std::sort(ui.playerIdList.begin(), ui.playerIdList.end());

    if (ui.baseTimeUnit <= 0 && state.timeUnit > 0)
        ui.baseTimeUnit = state.timeUnit;
}

void HUD::drawPanel(sf::RenderWindow &win, float x, float y, float w, float h, sf::Color fill) {
    sf::RectangleShape r({w, h});
    r.setPosition(x, y); r.setFillColor(fill);
    r.setOutlineColor({70, 75, 120, 210}); r.setOutlineThickness(1.f);
    win.draw(r);
}

void HUD::drawText(sf::RenderWindow &win, const std::string &txt,
                   float x, float y, unsigned sz, sf::Color col) {
    if (!_fontLoaded) return;
    sf::Text t; t.setFont(_font); t.setString(txt);
    t.setCharacterSize(sz); t.setFillColor(col); t.setPosition(x, y);
    win.draw(t);
}

const char *HUD::eventLabel(GameEventType t) {
    switch (t) {
        case GameEventType::Spawn: return "SPAWN";
        case GameEventType::Move: return "MOVE";
        case GameEventType::LevelUp: return "LEVEL";
        case GameEventType::Death: return "DEATH";
        case GameEventType::Eject: return "EJECT";
        case GameEventType::Fork: return "FORK";
        case GameEventType::Take: return "TAKE";
        case GameEventType::Drop: return "DROP";
        case GameEventType::Broadcast: return "BROADCAST";
        case GameEventType::EggNew: return "EGG+";
        case GameEventType::EggHatch: return "HATCH";
        case GameEventType::EggDeath: return "EGG-";
        case GameEventType::IncantStart: return "INCANT+";
        case GameEventType::IncantEnd: return "INCANT-";
        case GameEventType::EndGame: return "END";
        case GameEventType::ServerMsg: return "MSG";
    }
    return "?";
}

const char *HUD::orientLabel(int o) {
    static const char *d[] = {"?", "N", "E", "S", "W"};
    return (o >= 1 && o <= 4) ? d[o] : d[0];
}

const char *HUD::activityLabel(PlayerActivity a) {
    static const char *l[] = {"Idle","Move","Take","Drop","Fork","Incant","Dead"};
    int i = (int)a;
    return (i >= 0 && i <= 6) ? l[i] : "?";
}

const char *HUD::resName(int r) {
    static const char *n[] = {"food","linemate","deraumere","sibur","mendiane","phiras","thystame"};
    return (r >= 0 && r < 7) ? n[r] : "?";
}

void HUD::drawEventFeed(sf::RenderWindow &win, const GameState &state,
                        float x, float y, float w, float h) {
    drawPanel(win, x, y, w, h);
    drawText(win, "EVENT FEED", x + 8, y + 6, 13, {160, 170, 255});
    float ly = y + 26;
    int shown = 0;
    for (const auto &ev : state.eventLog) {
        if (shown++ >= 14 || ly > y + h - 14) break;
        std::ostringstream oss;
        oss << eventLabel(ev.type);
        if (ev.playerId >= 0) oss << " #" << ev.playerId;
        if (ev.x >= 0) oss << " (" << ev.x << "," << ev.y << ")";
        if (ev.level > 0) oss << " L" << ev.level;
        if (ev.resource >= 0) oss << " " << resName(ev.resource);
        if (!ev.text.empty()) {
            std::string s = ev.text;
            if (ev.type == GameEventType::Broadcast && ev.playerId >= 0
                && state.players.count(ev.playerId))
                s = BroadcastCodec::displayText(s, state.players.at(ev.playerId).teamName);
            if (s.size() > 18) s = s.substr(0, 18) + "..";
            oss << " \"" << s << "\"";
        }
        if (ev.type == GameEventType::IncantEnd)
            oss << (ev.success ? " OK" : " FAIL");
        drawText(win, oss.str(), x + 8, ly, 10,
                 ev.type == GameEventType::Death ? sf::Color(255, 100, 100)
                 : ev.type == GameEventType::LevelUp ? sf::Color(255, 215, 80)
                 : sf::Color(180, 180, 190));
        ly += 14;
    }
}

void HUD::drawTileInspector(sf::RenderWindow &win, const GameState &state,
                            const UiState &ui, float x, float y, float w, float h) {
    drawPanel(win, x, y, w, h);
    drawText(win, "TILE INSPECTOR", x + 8, y + 6, 13, {160, 170, 255});
    int tx = ui.selectedTile.first, ty = ui.selectedTile.second;
    if (tx < 0) {
        drawText(win, "Clic sur la minimap", x + 8, y + 28, 12, {140, 140, 150});
        return;
    }
    std::ostringstream oss;
    float ly = y + 28;
    oss << "Pos (" << tx << "," << ty << ")"; drawText(win, oss.str(), x + 8, ly, 12); oss.str(""); ly += 18;

    auto it = state.tiles.find({tx, ty});
    if (it != state.tiles.end()) {
        const auto &r = it->second.resources;
        static const char *names[] = {"food","linemate","deraumere","sibur","mendiane","phiras","thystame"};
        const int vals[] = {r.food, r.linemate, r.deraumere, r.sibur, r.mendiane, r.phiras, r.thystame};
        for (int i = 0; i < 7; ++i) {
            oss << "  " << names[i] << ": " << vals[i];
            drawText(win, oss.str(), x + 8, ly, 10); oss.str(""); ly += 13;
        }
    }
    int players = 0;
    for (auto &[id, p] : state.players)
        if (p.x == tx && p.y == ty) ++players;
    int eggCount = 0;
    for (auto &[eid, e] : state.eggs)
        if (e.x == tx && e.y == ty) ++eggCount;
    oss << "Joueurs: " << players; drawText(win, oss.str(), x + 8, ly, 11); oss.str(""); ly += 16;
    oss << "Oeufs:   " << eggCount; drawText(win, oss.str(), x + 8, ly, 11); ly += 16;

    if (state.incantations.count({tx, ty})) {
        oss << "Incantation L" << state.incantations.at({tx, ty}).level;
        drawText(win, oss.str(), x + 8, ly, 11, {180, 120, 255});
    }
}

void HUD::drawMinimap(sf::RenderWindow &win, const GameState &state,
                      const UiState &ui, const Camera &camera,
                      float x, float y, float size) {
    if (state.mapWidth <= 0) return;
    drawPanel(win, x, y, size, size);
    drawText(win, "MINI-MAP", x + 6, y + 4, 11, {160, 170, 255});

    float pad = 18.f;
    float inner = size - pad - 4.f;
    float cellW = inner / state.mapWidth;
    float cellH = inner / state.mapHeight;
    float ox = x + pad, oy = y + pad;

    const int mapArea = state.mapWidth * state.mapHeight;
    std::vector<int> density;
    if (mapArea > 0 && ui.filters.showPlayers) {
        density.assign((size_t)mapArea, 0);
        for (auto &[id, p] : state.players) {
            if (p.x < 0 || p.y < 0 || p.x >= state.mapWidth || p.y >= state.mapHeight)
                continue;
            ++density[(size_t)p.y * state.mapWidth + p.x];
        }
    }

    for (int cx = 0; cx < state.mapWidth; ++cx) {
        for (int cy = 0; cy < state.mapHeight; ++cy) {
            int d = density.empty() ? 0
                : density[(size_t)cy * state.mapWidth + cx];
            sf::RectangleShape cell({cellW - 0.5f, cellH - 0.5f});
            cell.setPosition(ox + cx * cellW, oy + cy * cellH);
            sf::Uint8 b = (sf::Uint8)(30 + d * 40);
            cell.setFillColor({b, b, (sf::Uint8)(50 + d * 30), 180});
            win.draw(cell);
        }
    }

    for (auto &[id, p] : state.players) {
        if (!ui.filters.showPlayers) break;
        glm::vec3 tc = IslandRenderer::teamColor(p.teamName);
        sf::CircleShape dot(2.f);
        dot.setOrigin(2, 2);
        dot.setPosition(ox + (p.x + 0.5f) * cellW, oy + (p.y + 0.5f) * cellH);
        dot.setFillColor(sf::Color((sf::Uint8)(tc.r * 255), (sf::Uint8)(tc.g * 255),
                                   (sf::Uint8)(tc.b * 255)));
        win.draw(dot);
    }

    for (auto &[eid, e] : state.eggs) {
        sf::CircleShape dot(1.5f);
        dot.setOrigin(1.5f, 1.5f);
        dot.setPosition(ox + (e.x + 0.5f) * cellW, oy + (e.y + 0.5f) * cellH);
        dot.setFillColor({240, 230, 180});
        win.draw(dot);
    }

    for (auto &[coord, inc] : state.incantations) {
        sf::RectangleShape hi({cellW, cellH});
        hi.setPosition(ox + coord.first * cellW, oy + coord.second * cellH);
        hi.setFillColor({180, 80, 255, 80});
        win.draw(hi);
    }

    if (ui.selectedTile.first >= 0) {
        sf::RectangleShape sel({cellW, cellH});
        sel.setPosition(ox + ui.selectedTile.first * cellW,
                        oy + ui.selectedTile.second * cellH);
        sel.setFillColor(sf::Color::Transparent);
        sel.setOutlineColor({255, 255, 100, 220});
        sel.setOutlineThickness(1.f);
        win.draw(sel);
    }

    glm::vec3 camPos = camera.getPosition();
    float offX = -(state.mapWidth - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
    float offZ = -(state.mapHeight - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
    float gx = (camPos.x - offX) / IslandRenderer::ISLAND_SPACING;
    float gy = (camPos.z - offZ) / IslandRenderer::ISLAND_SPACING;
    sf::CircleShape camDot(3.f);
    camDot.setOrigin(3, 3);
    camDot.setPosition(ox + gx * cellW, oy + gy * cellH);
    camDot.setFillColor({255, 255, 255, 200});
    camDot.setOutlineColor({0, 0, 0, 180});
    camDot.setOutlineThickness(1.f);
    win.draw(camDot);
}

void HUD::drawScoreboard(sf::RenderWindow &win, const GameState &state,
                         float x, float y, float w, float h) {
    drawPanel(win, x, y, w, h);
    drawText(win, "SCOREBOARD", x + 8, y + 6, 13, {160, 170, 255});
    float ly = y + 28;
    for (const auto &team : state.teamNames) {
        int alive = 0, maxLvl = 0, totalRes = 0;
        for (auto &[id, p] : state.players) {
            if (p.teamName != team) continue;
            ++alive;
            maxLvl = std::max(maxLvl, p.level);
            totalRes += p.inventory.food + p.inventory.linemate + p.inventory.deraumere
                      + p.inventory.sibur + p.inventory.mendiane + p.inventory.phiras
                      + p.inventory.thystame;
        }
        int forks = state.teamForkCounts.count(team) ? state.teamForkCounts.at(team) : 0;
        std::ostringstream oss;
        oss << team << "  maxL:" << maxLvl << "  J:" << alive
            << "  res:" << totalRes << "  fork:" << forks;
        drawText(win, oss.str(), x + 8, ly, 11);
        ly += 16;
    }
}

void HUD::drawTimeControl(sf::RenderWindow &win, const GameState &state,
                          UiState &ui, float x, float y, float w, float h,
                          std::function<void(const std::string &)> sendCmd) {
    (void)sendCmd;
    drawPanel(win, x, y, w, h);
    std::ostringstream oss;
    oss << "TIME  freq=" << state.timeUnit << "  x" << ui.timeSpeed;
    if (ui.paused) oss << "  [PAUSE]";
    drawText(win, oss.str(), x + 8, y + 6, 12, {180, 200, 255});

    static const char *labels[] = {"x1", "x2", "x4", "x8", "||"};
    float bx = x + 8, by = y + 24;
    for (int i = 0; i < 5; ++i) {
        sf::RectangleShape btn({28, 18});
        btn.setPosition(bx + i * 32, by);
        bool active = (i < 4 && ui.timeSpeed == (1 << i)) || (i == 4 && ui.paused);
        btn.setFillColor(active ? sf::Color(0, 180, 160, 200) : sf::Color(40, 50, 70, 200));
        btn.setOutlineColor({80, 90, 120}); btn.setOutlineThickness(1.f);
        win.draw(btn);
        drawText(win, labels[i], bx + i * 32 + 4, by + 2, 11);
    }
}

void HUD::drawDebugPanel(sf::RenderWindow &win, const RenderStats &stats,
                         float x, float y, float w, float h) {
    drawPanel(win, x, y, w, h);
    drawText(win, "PERF DEBUG", x + 8, y + 6, 13, {160, 170, 255});
    std::ostringstream oss;
    float ly = y + 26;
    oss << "FPS      " << (int)stats.fps; drawText(win, oss.str(), x + 8, ly, 11); oss.str(""); ly += 15;
    oss << "Tiles    " << stats.tilesRendered; drawText(win, oss.str(), x + 8, ly, 11); oss.str(""); ly += 15;
    oss << "Players  " << stats.playerCount; drawText(win, oss.str(), x + 8, ly, 11); oss.str(""); ly += 15;
    oss << "Ev/s     " << (int)stats.eventsPerSec; drawText(win, oss.str(), x + 8, ly, 11); oss.str(""); ly += 15;
    oss << "Ping~    " << (int)stats.pingMs << "ms"; drawText(win, oss.str(), x + 8, ly, 11);
}

void HUD::drawFilters(sf::RenderWindow &win, UiState &ui, float x, float y, float w, float h) {
    drawPanel(win, x, y, w, h);
    drawText(win, "FILTRES", x + 8, y + 6, 13, {160, 170, 255});
    struct { bool *v; const char *l; } items[] = {
        {&ui.filters.showResources, "Ressources"},
        {&ui.filters.showPlayers, "Joueurs"},
        {&ui.filters.showEggs, "Oeufs"},
        {&ui.filters.showBroadcasts, "Broadcasts"},
        {&ui.filters.showIncantations, "Incantations"},
    };
    float ly = y + 24;
    for (auto &it : items) {
        sf::RectangleShape box({12, 12});
        box.setPosition(x + 8, ly);
        box.setFillColor(*it.v ? sf::Color(0, 200, 180) : sf::Color(40, 45, 60));
        box.setOutlineColor({100, 110, 140}); box.setOutlineThickness(1.f);
        win.draw(box);
        drawText(win, it.l, x + 26, ly - 1, 11);
        ly += 18;
    }
}

void HUD::drawEndgame(sf::RenderWindow &win, const GameState &state,
                      UiState &ui, unsigned winW, unsigned winH) {
    if (!state.gameOver) return;
    float pulse = 0.85f + 0.15f * std::sin(ui.endgameAnimTime * 3.f);
    sf::RectangleShape dim({(float)winW, (float)winH});
    dim.setFillColor({0, 0, 0, 120});
    win.draw(dim);

    sf::Text winner;
    winner.setFont(_font);
    winner.setString("VICTOIRE : " + state.winner);
    winner.setCharacterSize((unsigned)(38 * pulse));
    winner.setFillColor({255, 215, 0});
    winner.setOutlineColor({0, 0, 0});
    winner.setOutlineThickness(3.f);
    auto b = winner.getLocalBounds();
    winner.setPosition((winW - b.width) * 0.5f, winH * 0.38f);
    win.draw(winner);

    int totalPlayers = (int)state.players.size();
    int totalEggs = (int)state.eggs.size();
    std::ostringstream oss;
    oss << "Equipes: " << state.teamNames.size()
        << "  Joueurs: " << totalPlayers
        << "  Oeufs: " << totalEggs;
    drawText(win, oss.str(), winW * 0.5f - 120, winH * 0.52f, 16, {220, 220, 230});
}

void HUD::drawConnectionStatus(sf::RenderWindow &win, const RenderStats &stats, float x, float y) {
    sf::Color c = stats.connected ? sf::Color(80, 220, 120) : sf::Color(255, 80, 80);
    sf::CircleShape dot(5);
    dot.setOrigin(5, 5); dot.setPosition(x, y); dot.setFillColor(c);
    win.draw(dot);
    drawText(win, stats.connected ? "Connecte" : "Deconnecte", x + 12, y - 8, 12, c);
}

void HUD::drawSpectatorHelp(sf::RenderWindow &win, const UiState &ui, float x, float y) {
    std::ostringstream oss;
    oss << "[ / ] joueur  T team  F focus";
    if (ui.followPlayerId >= 0) oss << "  #" << ui.followPlayerId;
    if (!ui.followTeam.empty()) oss << "  " << ui.followTeam;
    drawText(win, oss.str(), x, y, 11, {160, 170, 200});
}

bool HUD::isMouseOverHud(float mx, float my, unsigned winW, unsigned winH) const {
    if (mx < 230 && my < 500) return true;
    if (mx > winW - 220) return true;
    if (my > winH - 200) return true;
    if (mx > winW - 160 && my < 160) return true;
    return false;
}

bool HUD::handleEvent(const sf::Event &ev, GameState &state, UiState &ui,
                      const Camera &camera, unsigned winW, unsigned winH,
                      std::function<void(const std::string &)> sendCmd)
{
    if (ev.type == sf::Event::KeyPressed) {
        if (ev.key.code == sf::Keyboard::F) {
            if (ui.selectedPlayerId >= 0) ui.followPlayerId = ui.selectedPlayerId;
            return true;
        }
        if (ev.key.code == sf::Keyboard::LBracket) {
            if (!ui.playerIdList.empty()) {
                ui.spectatorIndex = (ui.spectatorIndex - 1 + (int)ui.playerIdList.size())
                                  % (int)ui.playerIdList.size();
                ui.followPlayerId = ui.playerIdList[ui.spectatorIndex];
                ui.selectedPlayerId = ui.followPlayerId;
            }
            return true;
        }
        if (ev.key.code == sf::Keyboard::RBracket) {
            if (!ui.playerIdList.empty()) {
                ui.spectatorIndex = (ui.spectatorIndex + 1) % (int)ui.playerIdList.size();
                ui.followPlayerId = ui.playerIdList[ui.spectatorIndex];
                ui.selectedPlayerId = ui.followPlayerId;
            }
            return true;
        }
        if (ev.key.code == sf::Keyboard::T) {
            if (!state.teamNames.empty()) {
                auto it = std::find(state.teamNames.begin(), state.teamNames.end(), ui.followTeam);
                if (it == state.teamNames.end()) ui.followTeam = state.teamNames[0];
                else {
                    ++it;
                    ui.followTeam = (it != state.teamNames.end()) ? *it : state.teamNames[0];
                }
            }
            return true;
        }
        if (ev.key.code == sf::Keyboard::P) { ui.paused = !ui.paused; return true; }
        if (ev.key.code == sf::Keyboard::H) { ui.showDebug = !ui.showDebug; return true; }
    }

    if (ev.type == sf::Event::MouseButtonPressed && ev.mouseButton.button == sf::Mouse::Left) {
        float mx = (float)ev.mouseButton.x, my = (float)ev.mouseButton.y;

        float tx = 6, ty = 120;
        for (int i = 0; i < 5; ++i) {
            if (mx >= tx + 8 + i * 32 && mx <= tx + 8 + i * 32 + 28
                && my >= ty + 24 && my <= ty + 42) {
                if (i == 4) ui.paused = !ui.paused;
                else {
                    ui.timeSpeed = 1 << i;
                    ui.paused = false;
                    if (ui.baseTimeUnit > 0 && sendCmd) {
                        int freq = ui.baseTimeUnit * ui.timeSpeed;
                        sendCmd("sst " + std::to_string(freq) + "\n");
                    }
                }
                return true;
            }
        }

        float fy = 200;
        struct { bool *v; } filt[] = {
            {&ui.filters.showResources}, {&ui.filters.showPlayers},
            {&ui.filters.showEggs}, {&ui.filters.showBroadcasts},
            {&ui.filters.showIncantations}
        };
        for (int i = 0; i < 5; ++i) {
            if (mx >= 14 && mx <= 26 && my >= fy + 24 + i * 18 && my <= fy + 36 + i * 18) {
                *filt[i].v = !*filt[i].v;
                return true;
            }
        }

        float px = (float)winW - 220, py = 120;
        if (_playerPanel.handleClick(mx, my, px, py, 210, 200, state, ui.selectedPlayerId))
            return true;
        if (_teamPanel.handleClick(mx, my, px, py + 210, 210, 140, state, ui.followTeam))
            return true;

        float mmX = (float)winW - 160, mmY = 6, mmS = 150;
        if (mx >= mmX && mx <= mmX + mmS && my >= mmY + 18 && my <= mmY + mmS) {
            if (state.mapWidth > 0) {
                float pad = 18.f, inner = mmS - pad - 4.f;
                float cellW = inner / state.mapWidth;
                float cellH = inner / state.mapHeight;
                int cx = (int)((mx - mmX - pad) / cellW);
                int cy = (int)((my - mmY - pad) / cellH);
                if (cx >= 0 && cx < state.mapWidth && cy >= 0 && cy < state.mapHeight) {
                    ui.selectedTile = {cx, cy};
                    float offX = -(state.mapWidth - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
                    float offZ = -(state.mapHeight - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
                    (void)camera;
                    (void)offX; (void)offZ;
                }
            }
            return true;
        }

        if (!isMouseOverHud(mx, my, winW, winH) && state.mapWidth > 0) {
            float offX = -(state.mapWidth - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
            float offZ = -(state.mapHeight - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
            int best = -1;
            float bestD = 30.f;
            for (auto &[id, p] : state.players) {
                float wx = offX + p.x * IslandRenderer::ISLAND_SPACING;
                float wz = offZ + p.y * IslandRenderer::ISLAND_SPACING;
                glm::vec4 clip = camera.getProjection((float)winW / (float)winH)
                    * camera.getView() * glm::vec4(wx, 1.f, wz, 1.f);
                if (clip.w <= 0.f) continue;
                float sx = (clip.x / clip.w * 0.5f + 0.5f) * winW;
                float sy = (-clip.y / clip.w * 0.5f + 0.5f) * winH;
                float d = std::hypot(sx - mx, sy - my);
                if (d < bestD) { bestD = d; best = id; }
            }
            if (best >= 0) {
                ui.selectedPlayerId = best;
                ui.followPlayerId = best;
            }
            return best >= 0;
        }
    }
    return false;
}

void HUD::draw(sf::RenderWindow &win, const GameState &state, UiState &ui,
               const Camera &camera, const RenderStats &stats,
               unsigned winW, unsigned winH)
{
    if (!_fontLoaded) return;

    drawPanel(win, 6, 6, 210, 108);
    std::ostringstream oss;
    oss << "Map     " << state.mapWidth << " x " << state.mapHeight;
    drawText(win, oss.str(), 14, 12, 14, {180, 200, 255}); oss.str("");
    oss << "Players " << state.players.size(); drawText(win, oss.str(), 14, 32); oss.str("");
    oss << "Teams   " << state.teamNames.size(); drawText(win, oss.str(), 14, 50); oss.str("");
    oss << "Eggs    " << state.eggs.size(); drawText(win, oss.str(), 14, 68); oss.str("");
    oss << "Time    " << state.timeUnit; drawText(win, oss.str(), 14, 86);

    drawConnectionStatus(win, stats, 170, 14);
    drawTimeControl(win, state, ui, 6, 120, 210, 50, nullptr);
    drawFilters(win, ui, 6, 200, 210, 120);

    if (ui.showEventFeed)
        drawEventFeed(win, state, 6, (float)winH - 210, 280, 200);
    drawTileInspector(win, state, ui, 6, 330, 210, 180);

    if (ui.showMinimap)
        drawMinimap(win, state, ui, camera, (float)winW - 160, 6, 150);

    _playerPanel.draw(win, _font, state, ui.selectedPlayerId,
                      (float)winW - 220, 120, 210, 200);
    if (ui.showScoreboard)
        _teamPanel.draw(win, _font, state, (float)winW - 220, 330, 210, 140);
    drawScoreboard(win, state, (float)winW - 220, 480, 210, 100);

    if (ui.showDebug)
        drawDebugPanel(win, stats, (float)winW - 220, (float)winH - 110, 210, 100);

    drawSpectatorHelp(win, ui, 6, (float)winH - 24);

    if (ui.filters.showBroadcasts) {
        const float offX = -(state.mapWidth - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
        const float offZ = -(state.mapHeight - 1) * 0.5f * IslandRenderer::ISLAND_SPACING;
        float aspect = (float)winW / (float)winH;
        for (const auto &b : state.broadcastBubbles) {
            if (!state.players.count(b.playerId)) continue;
            const Player &p = state.players.at(b.playerId);
            float wx = offX + p.x * IslandRenderer::ISLAND_SPACING;
            float wz = offZ + p.y * IslandRenderer::ISLAND_SPACING;
            glm::vec4 clip = camera.getProjection(aspect) * camera.getView()
                           * glm::vec4(wx, 1.5f, wz, 1.f);
            if (clip.w <= 0.f) continue;
            float sx = (clip.x / clip.w * 0.5f + 0.5f) * winW;
            float sy = (-clip.y / clip.w * 0.5f + 0.5f) * winH;
            std::string msg = BroadcastCodec::displayText(b.msg, p.teamName);
            if (msg.size() > 24) msg = msg.substr(0, 24) + "..";
            drawPanel(win, sx - 4, sy - 18, 120, 20, {20, 40, 60, 200});
            drawText(win, msg, sx, sy - 16, 10, {180, 240, 255});
        }
    }

    static const char *RES_NAME[7] = {
        "food","linemate","deraumere","sibur","mendiane","phiras","thystame"
    };
    static const sf::Color RES_SFML[7] = {
        {243,204,38},{190,190,204},{38,140,242},{242,102,25},{191,38,217},{38,230,115},{242,25,63}
    };
    float ly = (float)winH - 7 * 20.f - 16.f;
    if (ly > 400) {
        drawPanel(win, 290, ly - 4, 150, 7 * 20.f + 10);
        for (int i = 0; i < 7; ++i) {
            sf::RectangleShape dot({12.f, 12.f});
            dot.setPosition(298.f, ly + i * 20.f + 3.f);
            dot.setFillColor(RES_SFML[i]);
            win.draw(dot);
            drawText(win, RES_NAME[i], 316.f, ly + i * 20.f, 12);
        }
    }

    drawEndgame(win, state, ui, winW, winH);
}
