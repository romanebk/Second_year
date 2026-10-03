#include "HomeScreen.hpp"
#include <cmath>
#include <sstream>
#include <cctype>
#include <iostream>
#include "AboutScreen.hpp"
#include "BackgroundMusic.hpp"

static const sf::Color BG(4, 6, 10);
static const sf::Color TEAL(0, 230, 210);
static const sf::Color TEAL_DIM(0, 160, 148, 180);
static const sf::Color WHITE(255, 255, 255);
static const sf::Color WHITE_DIM(255, 255, 255, 160);
static const sf::Color GRAY_MID(120, 130, 150);
static const sf::Color GRAY_DARK(40, 50, 65);
static const sf::Color RED_DIM(200, 60, 60, 200);

static const char *BTN_LABELS[4] = {"CONNECTER", "LOCALHOST", "A PROPOS", "QUITTER"};


HomeScreen::HomeScreen(const std::string &defaultIp,
                       const std::string &defaultPort,
                       const std::string &errorMsg)
    : _ip(defaultIp.empty() ? "localhost" : defaultIp),
      _port(defaultPort),
      _errorMsg(errorMsg)
{
}


bool HomeScreen::isValidPort(const std::string &s) const
{
    if (s.empty())
        return false;
    for (size_t i = 0; i < s.size(); i++)
        if (!std::isdigit(s[i]))
            return false;
    return true;
}

bool HomeScreen::isValidHost(const std::string &s) const
{
    if (s.empty())
        return false;
    for (size_t i = 0; i < s.size(); i++) {
        unsigned char c = static_cast<unsigned char>(s[i]);
        if (std::isspace(c))
            return false;
    }
    return true;
}


bool HomeScreen::loadFont()
{
    for (auto path : {
             "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
             "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
             "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
             "/usr/share/fonts/truetype/ubuntu/UbuntuMono-B.ttf",
             "/System/Library/Fonts/Courier.ttc",
             "/System/Library/Fonts/Helvetica.ttc"})
        if (_font.loadFromFile(path))
            return true;
    return false;
}

bool HomeScreen::loadTextures()
{
    bool ok = true;
    ok &= _texNebula.loadFromFile("assets/scenery/nebula_bg.jpg");
    ok &= _texPlanetLava.loadFromFile("assets/scenery/planet_lava.jpg");
    ok &= _texPlanetHorizon.loadFromFile("assets/scenery/planet_horizon_blue.jpg");
    ok &= _texCrystal.loadFromFile("assets/scenery/crystal_cluster.png");
    if (!ok)
        std::cerr << "[HomeScreen] Une ou plusieurs textures de decor sont introuvables.\n";
    _texNebula.setSmooth(true);
    _texPlanetLava.setSmooth(true);
    _texPlanetHorizon.setSmooth(true);
    _texCrystal.setSmooth(true);
    return ok;
}

void HomeScreen::drawMonoText(sf::RenderWindow &win, const std::string &str,
                              unsigned size, sf::Color col,
                              float x, float y, bool centerX)
{
    if (!_fontLoaded)
        return;
    sf::Text t;
    t.setFont(_font);
    t.setString(str);
    t.setCharacterSize(size);
    t.setFillColor(col);
    auto b = t.getLocalBounds();
    if (centerX)
        t.setOrigin(b.left + b.width * 0.5f, b.top);
    else
        t.setOrigin(b.left, b.top);
    t.setPosition(x, y);
    win.draw(t);
}





void HomeScreen::drawBackground(sf::RenderWindow &win, float t)
{
    win.clear(BG);

    if (!_texturesLoaded) return;

    
    {
        sf::Sprite s(_texNebula);
        sf::Vector2u sz = _texNebula.getSize();
        s.setScale((float)WIN_W / sz.x, (float)WIN_H / sz.y);
        sf::Color tint(255, 255, 255, 235);
        s.setColor(tint);
        win.draw(s);
    }

    
    {
        sf::Sprite s(_texPlanetLava);
        float targetSize = WIN_H * 0.15f;
        float scale = targetSize / _texPlanetLava.getSize().x;
        s.setScale(scale, scale);
        s.setPosition(WIN_W - targetSize * 0.85f, targetSize * 0.06f);
        s.setColor(sf::Color(255, 255, 255, 230));
        win.draw(s);
    }

    
    {
        sf::Sprite s(_texPlanetHorizon);
        sf::Vector2u sz = _texPlanetHorizon.getSize();
        float scale = (float)WIN_W / sz.x * 1.35f;
        s.setScale(scale, scale);
        float w = sz.x * scale;
        s.setPosition((WIN_W - w) * 0.5f, WIN_H - sz.y * scale * 0.62f);
        s.setColor(sf::Color(255, 255, 255, 235));
        win.draw(s);
    }

    
    
    auto crystalAt = [&](float fx, float fy, float scale, float rot, float phase) {
        sf::Sprite s(_texCrystal);
        sf::Vector2u sz = _texCrystal.getSize();
        s.setOrigin(sz.x * 0.5f, sz.y * 0.85f);
        float sc = (WIN_H * scale) / sz.x;
        s.setScale(sc, sc);
        s.setRotation(rot);
        s.setPosition(WIN_W * fx, WIN_H * fy);
        float pulse = 0.85f + 0.15f * std::sin(t * 1.4f + phase);
        s.setColor(sf::Color(255, 255, 255, (sf::Uint8)(255 * pulse)));
        win.draw(s);
    };
    crystalAt(0.045f, 0.78f, 0.16f,  -6.f, 0.f);
    crystalAt(0.965f, 0.62f, 0.13f,   8.f, 1.7f);
}


void HomeScreen::drawLogoLeft(sf::RenderWindow &win)
{
    drawMonoText(win, "ZAPPY", 56, WHITE, LEFT_W * 0.5f, 70.f, true);
    drawMonoText(win, "A TRIBUTE TO ZAPHOD BEEBLEBROX", 9,
                 sf::Color(255, 255, 255, 130), LEFT_W * 0.5f, 138.f, true);

    sf::RectangleShape sep({LEFT_W - 80.f, 1.f});
    sep.setPosition(40.f, 168.f);
    sep.setFillColor(sf::Color(0, 230, 210, 90));
    win.draw(sep);

    drawMonoText(win, "ETAT DU SERVEUR", 9, sf::Color(255, 255, 255, 70), 40.f, 196.f);

    sf::CircleShape dot(4.f);
    dot.setFillColor(sf::Color(255, 90, 90));
    dot.setPosition(40.f, 220.f);
    win.draw(dot);
    drawMonoText(win, "HORS LIGNE", 11, sf::Color(255, 120, 120), 56.f, 214.f);
}


void HomeScreen::drawConnBlock(sf::RenderWindow &win)
{
    drawMonoText(win, "CONNEXION AU SERVEUR", 10,
                 sf::Color(255, 255, 255, 70), BLK_X, BLK_Y - 24.f);

    sf::RectangleShape blk({BLK_W, BLK_H});
    blk.setPosition(BLK_X, BLK_Y);
    blk.setFillColor(sf::Color(6, 10, 16, 215));
    blk.setOutlineThickness(1.f);
    blk.setOutlineColor(sf::Color(0, 230, 210, 90));
    win.draw(blk);

    float fieldX = BLK_X + 22.f;
    float ipY = BLK_Y + 24.f;

    sf::RectangleShape diamond({8.f, 8.f});
    diamond.setOrigin(4.f, 4.f);
    diamond.setRotation(45.f);
    diamond.setFillColor(sf::Color::Transparent);
    diamond.setOutlineThickness(1.f);
    diamond.setOutlineColor(sf::Color(0, 230, 210, 200));
    diamond.setPosition(fieldX + 4.f, ipY + 6.f);
    win.draw(diamond);
    drawMonoText(win, "ADRESSE IP", 10, sf::Color(255, 255, 255, 90),
                 fieldX + 18.f, ipY);

    sf::RectangleShape ipBox({BLK_W - 44.f, 38.f});
    ipBox.setPosition(fieldX, ipY + 18.f);
    ipBox.setFillColor(sf::Color(255, 255, 255, _editingIP ? 18 : 10));
    ipBox.setOutlineThickness(1.f);
    ipBox.setOutlineColor(_editingIP ? TEAL : GRAY_DARK);
    win.draw(ipBox);
    drawMonoText(win, _ip + (_editingIP ? "_" : ""), 16,
                 _editingIP ? WHITE : WHITE_DIM,
                 fieldX + 10.f, ipY + 28.f);

    sf::RectangleShape sep({BLK_W - 44.f, 1.f});
    sep.setPosition(fieldX, BLK_Y + BLK_H * 0.52f);
    sep.setFillColor(GRAY_DARK);
    win.draw(sep);

    float portY = BLK_Y + BLK_H * 0.55f;

    diamond.setPosition(fieldX + 4.f, portY + 6.f);
    win.draw(diamond);
    drawMonoText(win, "PORT", 10, sf::Color(255, 255, 255, 90),
                 fieldX + 18.f, portY);

    sf::RectangleShape portBox({BLK_W - 44.f, 38.f});
    portBox.setPosition(fieldX, portY + 18.f);
    portBox.setFillColor(sf::Color(255, 255, 255, _editingPort ? 18 : 10));
    portBox.setOutlineThickness(1.f);
    portBox.setOutlineColor(_editingPort ? TEAL : GRAY_DARK);
    win.draw(portBox);
    drawMonoText(win, _port + (_editingPort ? "_" : ""), 16,
                 _editingPort ? WHITE : WHITE_DIM,
                 fieldX + 10.f, portY + 28.f);
}


sf::FloatRect HomeScreen::buttonRect(int idx) const
{
    float y = BTN_Y0 + idx * (BTN_H + BTN_GAP);
    return {BTN_X, y, BTN_W, BTN_H};
}

int HomeScreen::hitButton(float mx, float my) const
{
    for (int i = 0; i < 4; ++i)
    {
        auto r = buttonRect(i);
        if (mx >= r.left && mx <= r.left + r.width &&
            my >= r.top && my <= r.top + r.height)
            return i;
    }
    return -1;
}

void HomeScreen::drawButtons(sf::RenderWindow &win, int hovered)
{
    for (int i = 0; i < 4; ++i)
    {
        auto r = buttonRect(i);
        bool hov = (i == hovered);

        sf::Color fillCol, outlineCol, textCol;
        if (i == 0) {
            fillCol = hov ? sf::Color(0, 230, 210, 45) : sf::Color(0, 230, 210, 18);
            outlineCol = hov ? TEAL : TEAL_DIM;
            textCol = hov ? WHITE : TEAL;
        } else if (i == 3) {
            fillCol = hov ? sf::Color(200, 60, 60, 35) : sf::Color::Transparent;
            outlineCol = hov ? RED_DIM : GRAY_DARK;
            textCol = hov ? sf::Color(220, 80, 80) : GRAY_MID;
        } else {
            fillCol = hov ? sf::Color(255, 255, 255, 16) : sf::Color(255,255,255,4);
            outlineCol = hov ? sf::Color(255, 255, 255, 80) : GRAY_DARK;
            textCol = hov ? WHITE : GRAY_MID;
        }

        sf::RectangleShape btn({r.width, r.height});
        btn.setPosition(r.left, r.top);
        btn.setFillColor(fillCol);
        btn.setOutlineThickness(1.f);
        btn.setOutlineColor(outlineCol);
        win.draw(btn);

        if (i == 0) {
            sf::ConvexShape tri(3);
            tri.setPoint(0, {0.f, 0.f});
            tri.setPoint(1, {15.f, 8.f});
            tri.setPoint(2, {0.f, 16.f});
            tri.setFillColor(hov ? WHITE : TEAL);
            tri.setPosition(r.left + 20.f, r.top + BTN_H * 0.5f - 8.f);
            win.draw(tri);
        }

        float textX = (i == 0) ? r.left + 48.f : r.left + 22.f;
        drawMonoText(win, BTN_LABELS[i], 13, textCol,
                     textX, r.top + BTN_H * 0.5f - 9.f);

        if (i == 0 && hov)
            drawMonoText(win, ">", 13, WHITE, r.left + r.width - 30.f, r.top + BTN_H * 0.5f - 9.f);
    }
}


void HomeScreen::drawStatusBar(sf::RenderWindow &win)
{
    sf::RectangleShape line({(float)(WIN_W) - LEFT_W - 112.f, 1.f});
    line.setPosition(LEFT_W + 56.f, WIN_H - 48.f);
    line.setFillColor(GRAY_DARK);
    win.draw(line);

    drawMonoText(win, "EPITECH 2025", 10,
                 sf::Color(255, 255, 255, 35),
                 (float)WIN_W - 170.f, WIN_H - 34.f);

    if (!_errorMsg.empty()) {
        drawMonoText(win, "ERREUR: " + _errorMsg, 10,
                     sf::Color(220, 60, 60, 220),
                     LEFT_W + 56.f, WIN_H - 34.f);
    } else {
        drawMonoText(win, "STATUS: Pret a connecter", 10,
                     sf::Color(80, 220, 120, 180),
                     LEFT_W + 56.f, WIN_H - 34.f);
    }
}


void HomeScreen::handleTextInput(const sf::Event &ev)
{
    if (ev.type == sf::Event::TextEntered)
    {
        _errorMsg.clear();
        uint32_t c = ev.text.unicode;
        if (_editingIP)
        {
            if (c == 8 && !_ip.empty())
                _ip.pop_back();
            else if (c >= 32 && c < 127 && _ip.size() < 64)
                _ip += static_cast<char>(c);
        }
        if (_editingPort)
        {
            if (c == 8 && !_port.empty())
                _port.pop_back();
            else if (std::isdigit(c) && _port.size() < 5)
                _port += static_cast<char>(c);
        }
    }
}


HomeResult HomeScreen::run()
{
    _fontLoaded = loadFont();
    _texturesLoaded = loadTextures();

    sf::RenderWindow window(
        sf::VideoMode(WIN_W, WIN_H),
        "Zappy  --  Accueil",
        sf::Style::Close);
    window.setFramerateLimit(60);

    int hovered = -1;
    sf::Clock clock;

    while (window.isOpen())
    {
        sf::Event ev;
        while (window.pollEvent(ev))
        {
            if (ev.type == sf::Event::Closed)
                return {true};

            if (ev.type == sf::Event::KeyPressed &&
                ev.key.code == sf::Keyboard::Escape)
                return {true};

            if (ev.type == sf::Event::KeyPressed)
                BackgroundMusic::onKeyPressed(ev.key.code);

            if (ev.type == sf::Event::MouseButtonPressed &&
                ev.mouseButton.button == sf::Mouse::Left)
            {
                float mx = (float)ev.mouseButton.x;
                float my = (float)ev.mouseButton.y;

                float fieldX = BLK_X + 22.f;
                sf::FloatRect ipBox = {fieldX, BLK_Y + 42.f, BLK_W - 44.f, 38.f};
                float portY = BLK_Y + BLK_H * 0.55f;
                sf::FloatRect portBox = {fieldX, portY + 18.f, BLK_W - 44.f, 38.f};

                _editingIP = ipBox.contains(mx, my);
                _editingPort = portBox.contains(mx, my);

                int btn = hitButton(mx, my);
                if (btn == 0)
                {
                    if (!isValidHost(_ip)) {
                        _errorMsg = "Adresse IP invalide";
                        break;
                    }
                    if (!isValidPort(_port)) {
                        _errorMsg = "Le port doit etre un nombre valide";
                        break;
                    }
                    int p = std::stoi(_port);
                    return {false, _ip, p};
                }
                if (btn == 1)
                {
                    if (!isValidPort(_port)) {
                        _errorMsg = "Le port doit etre un nombre valide";
                        break;
                    }
                    int p = std::stoi(_port);
                    return {false, "localhost", p};
                }
                if (btn == 2)
                {
                    AboutScreen about;
                    about.run();
                }
                if (btn == 3)
                    return {true};
            }

            if (ev.type == sf::Event::MouseMoved)
                hovered = hitButton((float)ev.mouseMove.x, (float)ev.mouseMove.y);

            if (ev.type == sf::Event::KeyPressed &&
                ev.key.code == sf::Keyboard::Return &&
                !_editingIP && !_editingPort)
            {
                if (!isValidHost(_ip)) {
                    _errorMsg = "Adresse IP invalide";
                    break;
                }
                if (!isValidPort(_port)) {
                    _errorMsg = "Le port doit etre un nombre valide";
                    break;
                }
                int p = std::stoi(_port);
                return {false, _ip, p};
            }

            if (ev.type == sf::Event::KeyPressed &&
                ev.key.code == sf::Keyboard::Tab)
            {
                if (_editingIP) { _editingIP = false; _editingPort = true; }
                else            { _editingIP = true;  _editingPort = false; }
            }

            handleTextInput(ev);
        }

        float t = clock.getElapsedTime().asSeconds();
        drawBackground(window, t);
        drawLogoLeft(window);
        drawConnBlock(window);
        drawButtons(window, hovered);
        drawStatusBar(window);
        window.display();
    }
    return {true};
}
