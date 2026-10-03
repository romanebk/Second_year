#pragma once

#include <SFML/Graphics.hpp>
#include <string>

struct HomeResult {
    bool        quit  = false;
    std::string ip    = "localhost";
    int         port  = 4242;
};

class HomeScreen {
public:
    HomeScreen(const std::string &defaultIp = "localhost",
               const std::string &defaultPort = "4242",
               const std::string &errorMsg = "");
    HomeResult run();

private:
    bool loadFont();
    bool loadTextures();

    void drawBackground(sf::RenderWindow &win, float t);
    void drawLogoLeft  (sf::RenderWindow &win);
    void drawConnBlock (sf::RenderWindow &win);
    void drawButtons   (sf::RenderWindow &win, int hovered);
    void drawStatusBar (sf::RenderWindow &win);

    bool        isValidPort(const std::string &s) const;
    bool        isValidHost(const std::string &s) const;
    void        drawMonoText(sf::RenderWindow &win, const std::string &str,
                             unsigned size, sf::Color col,
                             float x, float y, bool centerX = false);
    sf::FloatRect buttonRect(int idx) const;
    int           hitButton (float mx, float my) const;

    void handleTextInput(const sf::Event &ev);
    bool _editingIP   = false;
    bool _editingPort = false;
    std::string _ip;
    std::string _port;
    std::string _errorMsg;

    static constexpr unsigned WIN_W    = 1280;
    static constexpr unsigned WIN_H    = 760;
    static constexpr float    LEFT_W   = 280.f;

    static constexpr float    BLK_X    = LEFT_W + 56.f;
    static constexpr float    BLK_Y    = 150.f;
    static constexpr float    BLK_W    = 420.f;
    static constexpr float    BLK_H    = 200.f;

    static constexpr float    BTN_X    = LEFT_W + 56.f;
    static constexpr float    BTN_W    = 420.f;
    static constexpr float    BTN_H    = 48.f;
    static constexpr float    BTN_GAP  = 12.f;
    static constexpr float    BTN_Y0   = BLK_Y + BLK_H + 36.f;

    static constexpr sf::Uint8 TEAL_R  = 0;
    static constexpr sf::Uint8 TEAL_G  = 230;
    static constexpr sf::Uint8 TEAL_B  = 210;

    sf::Font _font;
    bool     _fontLoaded = false;

    
    sf::Texture _texNebula, _texPlanetLava, _texPlanetHorizon, _texCrystal;
    bool        _texturesLoaded = false;
};
