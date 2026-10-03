#pragma once

#include <SFML/Graphics.hpp>
#include <vector>
#include <string>

struct Contributor {
    std::string name;
    std::string photoPath;
    std::string linkedinUrl;
};

class AboutScreen {
public:
    void run();

private:

    bool        loadFont();
    std::string loadDescription(const std::string &path) const;
    void        loadContributorPhotos();

    void drawBackground(sf::RenderWindow &win);
    void drawTitle     (sf::RenderWindow &win);
    void drawDescription(sf::RenderWindow &win);
    void drawContributors(sf::RenderWindow &win, int hovered);
    void drawHint       (sf::RenderWindow &win);

    std::vector<std::string> wrapText(const std::string &text,
                                      unsigned charSize,
                                      float maxWidth) const;

    static void openUrl(const std::string &url);

    int hitContributor(float mx, float my) const;

    static const std::vector<Contributor> CONTRIBUTORS;

    sf::Font _font;
    bool     _fontLoaded = false;

    std::string              _description;
    std::vector<std::string> _descriptionLines;

    std::vector<sf::Texture> _photoTextures;
    std::vector<sf::Sprite>  _photoSprites;
    std::vector<bool>        _photoLoaded;

    static constexpr unsigned WIN_W = 980;
    static constexpr unsigned WIN_H = 640;

    static constexpr float DESC_X     = 56.f;
    static constexpr float DESC_Y     = 96.f;
    static constexpr float DESC_W     = (float)WIN_W - 2.f * DESC_X;

    static constexpr float CARD_SIZE  = 110.f;
    static constexpr float CARD_GAP   = 26.f;
    static constexpr float CARD_LABEL_H = 22.f;
    static constexpr float CARDS_Y    = 380.f;

    static constexpr char  DESCRIPTION_PATH[] = "assets/about/description.txt";
};