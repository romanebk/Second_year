#include "menu/MenuScreen.hpp"
#include <cmath>

const sf::Color MenuScreen::CARD_ACCENT[3] = {
    sf::Color(210, 160,  60),   
    sf::Color( 60, 210, 220),   
    sf::Color( 60, 220, 120),   
};

const ThemeMode MenuScreen::MODES[3] = {
    ThemeMode::DeckImperial,
    ThemeMode::HoloTactique,
    ThemeMode::ScanOrbital,
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


ThemeMode MenuScreen::run()
{
    _fontLoaded = loadFont();

    sf::RenderWindow window(
        sf::VideoMode(WIN_W, WIN_H),
        "Zappy  \u2013  Choisissez un mode",
        sf::Style::Close
    );
    window.setFramerateLimit(60);

    int selected = 0;
    int hovered  = -1;

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

        window.clear(sf::Color(10, 12, 22));
        drawTitle(window);

        int active = (hovered >= 0) ? hovered : selected;
        for (int i = 0; i < 3; ++i)
            drawCard(window, i, i == active, i == selected && hovered < 0);

        drawHint(window);
        window.display();
    }
    return MODES[0];
}


void MenuScreen::drawCard(sf::RenderWindow &win, int idx, bool hovered, bool selected)
{
    const sf::Color accent = CARD_ACCENT[idx];
    float cx = cardX(idx);
    float cy = CARD_Y + (hovered ? -10.f : 0.f);

    
    if (hovered) {
        sf::RectangleShape shadow({CARD_W + 8.f, CARD_H + 8.f});
        shadow.setPosition(cx - 4.f + 8.f, cy - 4.f + 12.f);
        shadow.setFillColor(sf::Color(0, 0, 0, 90));
        win.draw(shadow);
    }

    
    sf::RectangleShape card({CARD_W, CARD_H});
    card.setPosition(cx, cy);
    card.setFillColor(hovered ? sf::Color(28, 32, 52) : sf::Color(18, 21, 38));
    card.setOutlineThickness(hovered ? 2.f : 1.f);
    card.setOutlineColor(hovered
        ? accent
        : sf::Color(accent.r, accent.g, accent.b, 100));
    win.draw(card);

    
    sf::RectangleShape band({CARD_W, 5.f});
    band.setPosition(cx, cy);
    band.setFillColor(accent);
    win.draw(band);

    
    {
        float ox = cx + CARD_W * 0.5f;
        float oy = cy + CARD_H * 0.38f;
        float s  = 42.f;   

        sf::Color cTop  (accent.r, accent.g, accent.b, 220);
        sf::Color cLeft (accent.r * 0.45f, accent.g * 0.45f, accent.b * 0.45f, 220);
        sf::Color cRight(accent.r * 0.65f, accent.g * 0.65f, accent.b * 0.65f, 220);

        
        sf::ConvexShape top(4);
        top.setPoint(0, {ox,      oy - s});
        top.setPoint(1, {ox + s,  oy - s * 0.5f});
        top.setPoint(2, {ox,      oy});
        top.setPoint(3, {ox - s,  oy - s * 0.5f});
        top.setFillColor(cTop);
        win.draw(top);

        
        sf::ConvexShape left(4);
        left.setPoint(0, {ox - s, oy - s * 0.5f});
        left.setPoint(1, {ox,     oy});
        left.setPoint(2, {ox,     oy + s * 0.5f});
        left.setPoint(3, {ox - s, oy});
        left.setFillColor(cLeft);
        win.draw(left);

        
        sf::ConvexShape right(4);
        right.setPoint(0, {ox,     oy});
        right.setPoint(1, {ox + s, oy - s * 0.5f});
        right.setPoint(2, {ox + s, oy});
        right.setPoint(3, {ox,     oy + s * 0.5f});
        right.setFillColor(cRight);
        win.draw(right);
    }

    
    if (_fontLoaded) {
        sf::Text name;
        name.setFont(_font);
        name.setString(themeName(MODES[idx]));
        name.setCharacterSize(18);
        name.setFillColor(hovered ? sf::Color::White : sf::Color(190, 195, 220));
        name.setStyle(sf::Text::Bold);
        auto b = name.getLocalBounds();
        name.setOrigin(b.left + b.width * 0.5f, b.top + b.height * 0.5f);
        name.setPosition(cx + CARD_W * 0.5f, cy + CARD_H * 0.78f);
        win.draw(name);

        
        if (selected) {
            sf::CircleShape dot(4.f);
            dot.setFillColor(accent);
            dot.setOrigin(4.f, 4.f);
            dot.setPosition(cx + CARD_W * 0.5f, cy + CARD_H * 0.91f);
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
    t.setCharacterSize(54);
    t.setFillColor(sf::Color(215, 220, 255));
    t.setStyle(sf::Text::Bold);
    auto b = t.getLocalBounds();
    t.setOrigin(b.left + b.width * 0.5f, b.top);
    t.setPosition(WIN_W * 0.5f, 26.f);
    win.draw(t);

    sf::Text sub;
    sub.setFont(_font);
    sub.setString("Choisissez un mode");
    sub.setCharacterSize(15);
    sub.setFillColor(sf::Color(100, 108, 155));
    auto b2 = sub.getLocalBounds();
    sub.setOrigin(b2.left + b2.width * 0.5f, b2.top);
    sub.setPosition(WIN_W * 0.5f, 90.f);
    win.draw(sub);
}

void MenuScreen::drawHint(sf::RenderWindow &win)
{
    if (!_fontLoaded) return;

    sf::Text h;
    h.setFont(_font);
    h.setString("\u2190 \u2192  naviguer      Entr\u00e9e / Clic  choisir");
    h.setCharacterSize(13);
    h.setFillColor(sf::Color(75, 82, 125));
    auto b = h.getLocalBounds();
    h.setOrigin(b.left + b.width * 0.5f, b.top);
    h.setPosition(WIN_W * 0.5f, WIN_H - 28.f);
    win.draw(h);
}
