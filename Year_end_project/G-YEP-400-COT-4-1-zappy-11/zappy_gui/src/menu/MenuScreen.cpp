#include "MenuScreen.hpp"
#include "BackgroundMusic.hpp"
#include <cmath>
#include <iostream>

const sf::Color MenuScreen::CARD_ACCENT[3] = {
    sf::Color( 90, 200,  90),
    sf::Color(230, 165,  70),
    sf::Color(200, 110, 130),
};

const ThemeMode MenuScreen::MODES[3] = {
    ThemeMode::Yavin,
    ThemeMode::Tatooine,
    ThemeMode::Jedha,
};

float MenuScreen::cardX(int i) const
{
    const float totalW = 3.f * CARD_W + 2.f * CARD_GAP;
    const float startX = (WIN_W - totalW) * 0.5f;
    return startX + i * (CARD_W + CARD_GAP);
}

bool MenuScreen::loadFont()
{
    for (auto path : {
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/ubuntu/Ubuntu-B.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/Arial.ttf" })
        if (_font.loadFromFile(path)) return true;
    return false;
}

bool MenuScreen::loadTextures()
{
    bool ok = true;
    ok &= _texNebula.loadFromFile("assets/scenery/nebula_bg.jpg");
    ok &= _texShip.loadFromFile("assets/scenery/ship.png");
    ok &= _texCard[0].loadFromFile("assets/scenery/card_yavin.jpg");
    ok &= _texCard[1].loadFromFile("assets/scenery/card_tatooine.png");
    ok &= _texCard[2].loadFromFile("assets/scenery/card_jedha.png");
    if (!ok)
        std::cerr << "[MenuScreen] Une ou plusieurs textures sont introuvables.\n";
    _texNebula.setSmooth(true);
    _texShip.setSmooth(true);
    for (auto &tex : _texCard) tex.setSmooth(true);
    return ok;
}


ThemeMode MenuScreen::run()
{
    _fontLoaded = loadFont();
    _texturesLoaded = loadTextures();

    sf::RenderWindow window(
        sf::VideoMode(WIN_W, WIN_H),
        "Zappy  \u2013  Choisissez un mode",
        sf::Style::Close
    );
    window.setFramerateLimit(60);

    int selected = 0;
    int hovered  = -1;
    sf::Clock clock;

    while (window.isOpen()) {
        sf::Event ev;
        while (window.pollEvent(ev)) {

            if (ev.type == sf::Event::Closed)
                return MODES[selected];

            if (ev.type == sf::Event::MouseMoved) {
                hovered = -1;
                float mx = (float)ev.mouseMove.x;
                float my = (float)ev.mouseMove.y;
                for (int i = 0; i < 3; ++i) {
                    if (mx >= cardX(i) && mx <= cardX(i) + CARD_W &&
                        my >= CARD_Y    && my <= CARD_Y + CARD_H) {
                        hovered = i;
                        break;
                    }
                }
            }

            if (ev.type == sf::Event::MouseButtonPressed &&
                ev.mouseButton.button == sf::Mouse::Left && hovered >= 0)
                return MODES[hovered];

            if (ev.type == sf::Event::KeyPressed) {
                BackgroundMusic::onKeyPressed(ev.key.code);
                switch (ev.key.code) {
                case sf::Keyboard::Left:
                    selected = (selected + 2) % 3;
                    hovered  = -1;
                    break;
                case sf::Keyboard::Right:
                    selected = (selected + 1) % 3;
                    hovered  = -1;
                    break;
                case sf::Keyboard::Return:
                case sf::Keyboard::Space:
                    return MODES[selected];
                case sf::Keyboard::Escape:
                    return MODES[0];
                default: break;
                }
            }
        }

        float t = clock.getElapsedTime().asSeconds();
        drawBackground(window, t);
        drawTitle(window);

        int active = (hovered >= 0) ? hovered : selected;
        for (int i = 0; i < 3; ++i)
            drawCard(window, i, i == active, i == selected && hovered < 0);

        drawHint(window);
        window.display();
    }
    return MODES[0];
}


void MenuScreen::drawBackground(sf::RenderWindow &win, float t)
{
    win.clear(sf::Color(8, 9, 14));

    if (!_texturesLoaded) return;

    
    {
        sf::Sprite s(_texNebula);
        sf::Vector2u sz = _texNebula.getSize();
        s.setScale((float)WIN_W / sz.x, (float)WIN_H / sz.y);
        win.draw(s);
    }

    
    
    {
        sf::Sprite s(_texShip);
        sf::Vector2u sz = _texShip.getSize();
        float targetW = WIN_H * 0.14f;
        float scale = targetW / sz.x;
        s.setScale(scale, scale);

        float travel = WIN_W + targetW * 2.f;
        float shipX = std::fmod(t * 90.f, travel) - targetW;
        float shipY = 40.f + 10.f * std::sin(t * 0.6f);

        s.setPosition(shipX, shipY);
        win.draw(s);
    }
}


void MenuScreen::drawCard(sf::RenderWindow &win, int idx, bool hovered, bool selected)
{
    const sf::Color accent = CARD_ACCENT[idx];
    float cx = cardX(idx);
    float cy = CARD_Y + (hovered ? -10.f : 0.f);

    if (hovered) {
        sf::RectangleShape shadow({CARD_W + 8.f, CARD_H + 8.f});
        shadow.setPosition(cx - 4.f + 8.f, cy - 4.f + 12.f);
        shadow.setFillColor(sf::Color(0, 0, 0, 110));
        win.draw(shadow);
    }

    
    
    
    if (_texturesLoaded) {
        sf::Sprite s(_texCard[idx]);
        sf::Vector2u sz = _texCard[idx].getSize();
        float scaleX = CARD_W / sz.x;
        float scaleY = (CARD_H * 0.62f) / sz.y;   
        float scale = std::max(scaleX, scaleY);
        s.setScale(scale, scale);

        float w = sz.x * scale, h = sz.y * scale;
        s.setPosition(cx - (w - CARD_W) * 0.5f, cy - (h - CARD_H * 0.62f) * 0.5f);

        
        sf::View prevView = win.getView();
        sf::FloatRect imgArea(cx, cy, CARD_W, CARD_H * 0.62f);
        sf::View clipView(imgArea);
        clipView.setViewport(sf::FloatRect(
            imgArea.left / WIN_W, imgArea.top / WIN_H,
            imgArea.width / WIN_W, imgArea.height / WIN_H));
        win.setView(clipView);
        win.draw(s);
        win.setView(prevView);
    }

    
    
    sf::RectangleShape card({CARD_W, CARD_H});
    card.setPosition(cx, cy);
    card.setFillColor(sf::Color::Transparent);
    card.setOutlineThickness(hovered ? 2.5f : 1.5f);
    card.setOutlineColor(hovered ? accent : sf::Color(accent.r, accent.g, accent.b, 130));
    win.draw(card);

    
    sf::RectangleShape infoBand({CARD_W, CARD_H * 0.38f});
    infoBand.setPosition(cx, cy + CARD_H * 0.62f);
    infoBand.setFillColor(sf::Color(8, 10, 16, 235));
    win.draw(infoBand);

    sf::RectangleShape topBand({CARD_W, 4.f});
    topBand.setPosition(cx, cy);
    topBand.setFillColor(accent);
    win.draw(topBand);

    static const char* SUBTITLES[3] = {
        "ILOTS DE VEGETATION", "ENVIRONNEMENT DESERTIQUE", "MONDE MINERALIER"
    };
    static const char* DESCRIPTIONS[3] = {
        "Un ensemble d'ilots luxuriants\net mysterieux au coeur\nd'un monde tropical.",
        "Un monde aride et impitoyable\nou la survie depend\nde votre adaptabilite.",
        "Un monde riche en minerais\nprecieux mais dangereux\net instable."
    };

    if (_fontLoaded) {
        sf::Text name;
        name.setFont(_font);
        name.setString(themeName(MODES[idx]));
        name.setCharacterSize(22);
        name.setFillColor(hovered ? sf::Color::White : sf::Color(220, 222, 235));
        name.setStyle(sf::Text::Bold);
        auto b = name.getLocalBounds();
        name.setOrigin(b.left + b.width * 0.5f, b.top);
        name.setPosition(cx + CARD_W * 0.5f, cy + CARD_H * 0.66f);
        win.draw(name);

        sf::Text sub;
        sub.setFont(_font);
        sub.setString(SUBTITLES[idx]);
        sub.setCharacterSize(11);
        sub.setFillColor(accent);
        sub.setStyle(sf::Text::Bold);
        auto bs = sub.getLocalBounds();
        sub.setOrigin(bs.left + bs.width * 0.5f, bs.top);
        sub.setPosition(cx + CARD_W * 0.5f, cy + CARD_H * 0.735f);
        win.draw(sub);

        sf::Text desc;
        desc.setFont(_font);
        desc.setString(DESCRIPTIONS[idx]);
        desc.setCharacterSize(11);
        desc.setFillColor(sf::Color(170, 175, 195));
        desc.setLineSpacing(1.25f);
        auto bd = desc.getLocalBounds();
        desc.setOrigin(bd.left + bd.width * 0.5f, bd.top);
        desc.setPosition(cx + CARD_W * 0.5f, cy + CARD_H * 0.80f);
        win.draw(desc);

        if (selected) {
            sf::CircleShape dot(4.f);
            dot.setFillColor(accent);
            dot.setOrigin(4.f, 4.f);
            dot.setPosition(cx + CARD_W * 0.5f, cy + CARD_H - 14.f);
            win.draw(dot);
        }
    }
}


void MenuScreen::drawTitle(sf::RenderWindow &win)
{
    if (!_fontLoaded) return;

    sf::Text t;
    t.setFont(_font);
    t.setString("ZAPPY");
    t.setCharacterSize(60);
    t.setFillColor(sf::Color(225, 230, 255));
    t.setStyle(sf::Text::Bold);
    auto b = t.getLocalBounds();
    t.setOrigin(b.left + b.width * 0.5f, b.top);
    t.setPosition(WIN_W * 0.5f, 28.f);
    win.draw(t);

    sf::Text sub;
    sub.setFont(_font);
    sub.setString("CHOISISSEZ UN MODE");
    sub.setCharacterSize(15);
    sub.setFillColor(sf::Color(160, 168, 200));
    sub.setStyle(sf::Text::Bold);
    auto b2 = sub.getLocalBounds();
    sub.setOrigin(b2.left + b2.width * 0.5f, b2.top);
    sub.setPosition(WIN_W * 0.5f, 100.f);
    win.draw(sub);
}


void MenuScreen::drawHint(sf::RenderWindow &win)
{
    if (!_fontLoaded) return;

    sf::Text h;
    h.setFont(_font);
    h.setString("<-  ->  naviguer      Entree / Clic  choisir      Echap  retour");
    h.setCharacterSize(13);
    h.setFillColor(sf::Color(150, 156, 185));
    auto b = h.getLocalBounds();
    h.setOrigin(b.left + b.width * 0.5f, b.top);
    h.setPosition(WIN_W * 0.5f, WIN_H - 30.f);
    win.draw(h);
}
