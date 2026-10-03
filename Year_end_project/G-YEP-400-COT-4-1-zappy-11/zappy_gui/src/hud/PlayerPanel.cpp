#include "PlayerPanel.hpp"
#include <sstream>

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

void PlayerPanel::draw(sf::RenderWindow &win, sf::Font &font,
                       const GameState &state, int selectedId,
                       float x, float y, float w, float h)
{
    panel(win, x, y, w, h);
    lbl(win, font, "JOUEUR INSPECTOR", x + 8, y + 6, 13, {160, 170, 255});

    if (selectedId < 0 || !state.players.count(selectedId)) {
        lbl(win, font, "Clic sur la map ou liste", x + 8, y + 28, 12, {140, 140, 150});
        float ly = y + 50;
        for (auto &[id, p] : state.players) {
            if (ly > y + h - 16) break;
            std::ostringstream oss;
            oss << "#" << id << "  L" << p.level << "  " << p.teamName;
            lbl(win, font, oss.str(), x + 8, ly, 11, {180, 180, 190});
            ly += 16;
        }
        return;
    }

    const Player &p = state.players.at(selectedId);
    std::ostringstream oss;
    float ly = y + 28;

    oss << "ID    #" << p.id;           lbl(win, font, oss.str(), x + 8, ly, 12); oss.str(""); ly += 18;
    oss << "Pos   (" << p.x << "," << p.y << ")"; lbl(win, font, oss.str(), x + 8, ly, 12); oss.str(""); ly += 18;

    static const char *dirs[] = {"?", "N", "E", "S", "W"};
    int di = (p.orientation >= 1 && p.orientation <= 4) ? p.orientation : 0;
    oss << "Ori   " << dirs[di];        lbl(win, font, oss.str(), x + 8, ly, 12); oss.str(""); ly += 18;
    oss << "Level " << p.level;         lbl(win, font, oss.str(), x + 8, ly, 12); oss.str(""); ly += 18;
    oss << "Team  " << p.teamName;      lbl(win, font, oss.str(), x + 8, ly, 12); oss.str(""); ly += 18;

    static const char *acts[] = {"Idle","Move","Take","Drop","Fork","Incant","Dead"};
    int ai = (int)p.activity;
    if (ai >= 0 && ai <= 6)
        oss << "Etat  " << acts[ai];
    lbl(win, font, oss.str(), x + 8, ly, 12, {120, 220, 180}); ly += 20;

    lbl(win, font, "Inventaire (pin):", x + 8, ly, 11, {160, 160, 180}); ly += 16;
    static const char *res[] = {"food","linemate","deraumere","sibur","mendiane","phiras","thystame"};
    const int inv[] = {p.inventory.food, p.inventory.linemate, p.inventory.deraumere,
                       p.inventory.sibur, p.inventory.mendiane, p.inventory.phiras, p.inventory.thystame};
    for (int i = 0; i < 7; ++i) {
        oss << "  " << res[i] << ": " << inv[i];
        lbl(win, font, oss.str(), x + 8, ly, 10, {190, 190, 200});
        oss.str(""); ly += 14;
    }
}

bool PlayerPanel::handleClick(float mx, float my, float x, float y, float w, float h,
                              const GameState &state, int &outSelectedId)
{
    if (mx < x || mx > x + w || my < y || my > y + h) return false;
    if (outSelectedId >= 0) return true;

    float ly = y + 50;
    for (auto &[id, p] : state.players) {
        if (ly > y + h - 16) break;
        if (my >= ly && my < ly + 16) { outSelectedId = id; return true; }
        ly += 16;
    }
    return true;
}
