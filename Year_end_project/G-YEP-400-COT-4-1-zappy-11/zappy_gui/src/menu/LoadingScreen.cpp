#include "LoadingScreen.hpp"
#include "BackgroundMusic.hpp"
#include <cmath>
#include <sstream>
#include <iostream>


bool LoadingScreen::loadFont()
{
    for (auto path : {
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
            "/System/Library/Fonts/Helvetica.ttc" })
        if (_font.loadFromFile(path)) return true;
    return false;
}


void LoadingScreen::drawBackground(sf::RenderWindow &win, float)
{
    win.clear(sf::Color(6, 7, 12));
    if (!_texturesLoaded) return;

    sf::Sprite s(_texNebula);
    sf::Vector2u sz = _texNebula.getSize();
    s.setScale((float)WIN_W / sz.x, (float)WIN_H / sz.y);
    sf::Color tint(255, 255, 255, 160);   
    s.setColor(tint);
    win.draw(s);
}





void LoadingScreen::drawSpinner(sf::RenderWindow &win, sf::Vector2f center, float radius, float t)
{
    
    sf::CircleShape ring(radius, 64);
    ring.setOrigin(radius, radius);
    ring.setPosition(center);
    ring.setFillColor(sf::Color::Transparent);
    ring.setOutlineThickness(2.f);
    ring.setOutlineColor(sf::Color(0, 200, 220, 60));
    win.draw(ring);

    
    
    const int N = 26;
    for (int i = 0; i < N; ++i) {
        float a = t * 2.6f - i * 0.09f;
        float x = center.x + radius * std::cos(a);
        float y = center.y + radius * std::sin(a);
        float fade = 1.f - (float)i / N;

        sf::CircleShape dot(2.5f * fade + 0.5f);
        dot.setOrigin(dot.getRadius(), dot.getRadius());
        dot.setPosition(x, y);
        dot.setFillColor(sf::Color(80, 220, 240, (sf::Uint8)(220 * fade)));
        win.draw(dot);
    }

    
    float pulse = 0.85f + 0.15f * std::sin(t * 3.f);
    sf::CircleShape core(radius * 0.32f * pulse);
    core.setOrigin(core.getRadius(), core.getRadius());
    core.setPosition(center);
    core.setFillColor(sf::Color(90, 220, 255, 230));
    win.draw(core);

    sf::CircleShape coreGlow(radius * 0.32f * pulse * 1.6f);
    coreGlow.setOrigin(coreGlow.getRadius(), coreGlow.getRadius());
    coreGlow.setPosition(center);
    coreGlow.setFillColor(sf::Color(90, 220, 255, 40));
    win.draw(coreGlow);
}


void LoadingScreen::drawProgress(sf::RenderWindow &win, float ratio, const std::string &label)
{
    float barW = 460.f, barH = 8.f;
    float bx = (WIN_W - barW) * 0.5f, by = WIN_H * 0.66f;

    sf::RectangleShape track({barW, barH});
    track.setPosition(bx, by);
    track.setFillColor(sf::Color(255, 255, 255, 25));
    win.draw(track);

    sf::RectangleShape fill({barW * std::clamp(ratio, 0.f, 1.f), barH});
    fill.setPosition(bx, by);
    fill.setFillColor(sf::Color(90, 220, 255));
    win.draw(fill);

    if (_fontLoaded) {
        sf::Text t;
        t.setFont(_font);
        t.setString(label);
        t.setCharacterSize(14);
        t.setFillColor(sf::Color(200, 210, 230));
        auto b = t.getLocalBounds();
        t.setOrigin(b.left + b.width * 0.5f, b.top);
        t.setPosition(WIN_W * 0.5f, by - 32.f);
        win.draw(t);

        std::ostringstream pct;
        pct << (int)(std::clamp(ratio, 0.f, 1.f) * 100.f) << " %";
        sf::Text p;
        p.setFont(_font);
        p.setString(pct.str());
        p.setCharacterSize(13);
        p.setFillColor(sf::Color(140, 150, 175));
        auto bp = p.getLocalBounds();
        p.setOrigin(bp.left + bp.width * 0.5f, bp.top);
        p.setPosition(WIN_W * 0.5f, by + 16.f);
        win.draw(p);
    }
}




bool LoadingScreen::run(SharedState &shared)
{
    _fontLoaded = loadFont();
    _texturesLoaded = _texNebula.loadFromFile("assets/scenery/nebula_bg.jpg");
    if (_texturesLoaded) _texNebula.setSmooth(true);

    sf::RenderWindow window(
        sf::VideoMode(WIN_W, WIN_H),
        "Zappy  --  Chargement",
        sf::Style::Close
    );
    window.setFramerateLimit(60);

    sf::Clock clock;
    sf::Clock stabilityClock;   
    int lastPlayerCount = -1;

    while (window.isOpen()) {
        sf::Event ev;
        while (window.pollEvent(ev)) {
            if (ev.type == sf::Event::Closed)
                return false;
            if (ev.type == sf::Event::KeyPressed &&
                ev.key.code == sf::Keyboard::Escape)
                return false;
            if (ev.type == sf::Event::KeyPressed)
                BackgroundMusic::onKeyPressed(ev.key.code);
        }

        GameState state = shared.read();
        float elapsed = clock.getElapsedTime().asSeconds();

        
        static constexpr int MAX_MAP_DIM = 256;
        bool mapDimsOk = state.mapWidth > 0 && state.mapHeight > 0
                      && state.mapWidth <= MAX_MAP_DIM && state.mapHeight <= MAX_MAP_DIM;
        long long totalTiles = (long long)state.mapWidth * state.mapHeight;
        bool mapReady = mapDimsOk && totalTiles > 0
                     && (long long)state.tiles.size() >= totalTiles;
        float mapRatio = (totalTiles > 0 && mapDimsOk)
            ? std::min(1.f, (float)state.tiles.size() / (float)totalTiles)
            : 0.f;

        
        int playerCount = (int)state.players.size();
        if (playerCount != lastPlayerCount) {
            lastPlayerCount = playerCount;
            stabilityClock.restart();
        }
        bool playersReady = (playerCount > 0) &&
                            (stabilityClock.getElapsedTime().asSeconds() >= STABILITY_DELAY);

        bool everythingReady = mapReady && playersReady;
        bool timedOut = elapsed > MAX_WAIT;

        if (everythingReady || timedOut)
            return true;

        
        drawBackground(window, elapsed);

        if (_fontLoaded) {
            sf::Text title;
            title.setFont(_font);
            title.setString("ZAPPY");
            title.setCharacterSize(48);
            title.setFillColor(sf::Color(225, 230, 255));
            title.setStyle(sf::Text::Bold);
            auto b = title.getLocalBounds();
            title.setOrigin(b.left + b.width * 0.5f, b.top);
            title.setPosition(WIN_W * 0.5f, 60.f);
            window.draw(title);
        }

        drawSpinner(window, {WIN_W * 0.5f, WIN_H * 0.40f}, 70.f, elapsed);

        std::string label = !mapReady
            ? "Reception de la carte..."
            : "Synchronisation des joueurs...";
        float ratio = !mapReady ? mapRatio : 1.f;
        drawProgress(window, ratio, label);

        if (_fontLoaded) {
            sf::Text hint;
            hint.setFont(_font);
            hint.setString("Echap pour annuler");
            hint.setCharacterSize(11);
            hint.setFillColor(sf::Color(255, 255, 255, 70));
            auto b = hint.getLocalBounds();
            hint.setOrigin(b.left + b.width * 0.5f, b.top);
            hint.setPosition(WIN_W * 0.5f, WIN_H - 40.f);
            window.draw(hint);
        }

        window.display();
    }
    return false;
}
