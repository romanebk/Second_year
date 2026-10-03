#include "AboutScreen.hpp"
#include <fstream>
#include <sstream>
#include <cstdlib>
#include <iostream>

const std::vector<Contributor> AboutScreen::CONTRIBUTORS = {
    {"Alice Martin",  "assets/contributors/alice.jpg",  "https://www.linkedin.com/in/alice-martin-example"},
};

bool AboutScreen::loadFont()
{
    for (auto path : {
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
            "/usr/share/fonts/truetype/ubuntu/UbuntuMono-R.ttf",
            "/System/Library/Fonts/Menlo.ttc" })
        if (_font.loadFromFile(path)) return true;
    return false;
}

std::string AboutScreen::loadDescription(const std::string &path) const
{
    std::ifstream file(path);
    if (!file) {
        return "Description indisponible.\n"
               "(fichier assets/about/description.txt introuvable)";
    }
    std::stringstream ss;
    ss << file.rdbuf();
    return ss.str();
}

std::vector<std::string> AboutScreen::wrapText(const std::string &text,
                                               unsigned charSize,
                                               float maxWidth) const
{
    std::vector<std::string> lines;
    if (!_fontLoaded) { lines.push_back(text); return lines; }

    sf::Text probe;
    probe.setFont(_font);
    probe.setCharacterSize(charSize);

    std::istringstream stream(text);
    std::string paragraph;

    while (std::getline(stream, paragraph, '\n')) {
        if (paragraph.empty()) { lines.push_back(""); continue; }

        std::istringstream words(paragraph);
        std::string word, current;

        while (words >> word) {
            std::string attempt = current.empty() ? word : current + " " + word;
            probe.setString(attempt);
            float w = probe.getLocalBounds().width;

            if (w > maxWidth && !current.empty()) {
                lines.push_back(current);
                current = word;
            } else {
                current = attempt;
            }
        }
        if (!current.empty()) lines.push_back(current);
    }
    return lines;
}

void AboutScreen::loadContributorPhotos()
{
    size_t n = CONTRIBUTORS.size();
    _photoTextures.resize(n);
    _photoSprites.resize(n);
    _photoLoaded.resize(n, false);

    for (size_t i = 0; i < n; ++i) {
        if (_photoTextures[i].loadFromFile(CONTRIBUTORS[i].photoPath)) {
            _photoSprites[i].setTexture(_photoTextures[i]);

            sf::Vector2u sz = _photoTextures[i].getSize();
            float scale = CARD_SIZE / (float)std::max(sz.x, sz.y);
            _photoSprites[i].setScale(scale, scale);

            _photoLoaded[i] = true;
        } else {
            std::cerr << "[AboutScreen] Photo introuvable : "
                      << CONTRIBUTORS[i].photoPath << "\n";
            _photoLoaded[i] = false;
        }
    }
}

void AboutScreen::openUrl(const std::string &url)
{

    std::string cmd = "xdg-open \"" + url + "\" >/dev/null 2>&1 &";
    int ret = std::system(cmd.c_str());
    if (ret != 0)
        std::cerr << "[AboutScreen] xdg-open a retourné un code d'erreur ("
                  << ret << ") pour : " << url << "\n";
}

int AboutScreen::hitContributor(float mx, float my) const
{
    size_t n = CONTRIBUTORS.size();
    float totalW = n * CARD_SIZE + (n - 1) * CARD_GAP;
    float startX = ((float)WIN_W - totalW) * 0.5f;

    for (size_t i = 0; i < n; ++i) {
        float x = startX + i * (CARD_SIZE + CARD_GAP);
        sf::FloatRect rect(x, CARDS_Y, CARD_SIZE, CARD_SIZE + CARD_LABEL_H);
        if (rect.contains(mx, my))
            return (int)i;
    }
    return -1;
}

void AboutScreen::drawBackground(sf::RenderWindow &win)
{
    sf::RectangleShape bg({(float)WIN_W, (float)WIN_H});
    bg.setFillColor(sf::Color(8, 10, 16));
    win.draw(bg);

    sf::RectangleShape topBand({(float)WIN_W, 3.f});
    topBand.setFillColor(sf::Color(0, 230, 210));
    win.draw(topBand);
}

void AboutScreen::drawTitle(sf::RenderWindow &win)
{
    if (!_fontLoaded) return;

    sf::Text title;
    title.setFont(_font);
    title.setString("À PROPOS DE ZAPPY");
    title.setCharacterSize(28);
    title.setStyle(sf::Text::Bold);
    title.setFillColor(sf::Color(0, 230, 210));
    title.setPosition(DESC_X, 36.f);
    win.draw(title);
}

void AboutScreen::drawDescription(sf::RenderWindow &win)
{
    if (!_fontLoaded) return;

    float y = DESC_Y;
    const unsigned size = 14;
    const float lineHeight = 20.f;

    for (auto &line : _descriptionLines) {
        sf::Text t;
        t.setFont(_font);
        t.setString(line);
        t.setCharacterSize(size);
        t.setFillColor(sf::Color(200, 205, 215));
        t.setPosition(DESC_X, y);
        win.draw(t);
        y += lineHeight;
    }
}

void AboutScreen::drawContributors(sf::RenderWindow &win, int hovered)
{
    if (!_fontLoaded) return;

    size_t n = CONTRIBUTORS.size();
    float totalW = n * CARD_SIZE + (n - 1) * CARD_GAP;
    float startX = ((float)WIN_W - totalW) * 0.5f;

    sf::Text sectionTitle;
    sectionTitle.setFont(_font);
    sectionTitle.setString("CONTRIBUTEURS");
    sectionTitle.setCharacterSize(13);
    sectionTitle.setFillColor(sf::Color(255, 255, 255, 110));
    sectionTitle.setPosition(startX, CARDS_Y - 30.f);
    win.draw(sectionTitle);

    for (size_t i = 0; i < n; ++i) {
        float x = startX + i * (CARD_SIZE + CARD_GAP);
        float y = CARDS_Y;
        bool isHovered = ((int)i == hovered);

        float lift = isHovered ? -6.f : 0.f;

        sf::RectangleShape frame({CARD_SIZE + 6.f, CARD_SIZE + 6.f});
        frame.setPosition(x - 3.f, y - 3.f + lift);
        frame.setFillColor(sf::Color(20, 24, 34));
        frame.setOutlineThickness(isHovered ? 2.f : 1.f);
        frame.setOutlineColor(isHovered
            ? sf::Color(0, 230, 210)
            : sf::Color(255, 255, 255, 40));
        win.draw(frame);

        if (_photoLoaded[i]) {
            _photoSprites[i].setPosition(x, y + lift);
            win.draw(_photoSprites[i]);
        } else {
            sf::RectangleShape placeholder({CARD_SIZE, CARD_SIZE});
            placeholder.setPosition(x, y + lift);
            placeholder.setFillColor(sf::Color(40, 44, 56));
            win.draw(placeholder);

            sf::Text qm;
            qm.setFont(_font);
            qm.setString("?");
            qm.setCharacterSize(36);
            qm.setFillColor(sf::Color(90, 96, 116));
            auto b = qm.getLocalBounds();
            qm.setOrigin(b.left + b.width * 0.5f, b.top + b.height * 0.5f);
            qm.setPosition(x + CARD_SIZE * 0.5f, y + lift + CARD_SIZE * 0.5f);
            win.draw(qm);
        }

        sf::Text name;
        name.setFont(_font);
        name.setString(CONTRIBUTORS[i].name);
        name.setCharacterSize(12);
        name.setFillColor(isHovered ? sf::Color::White : sf::Color(170, 175, 195));
        auto nb = name.getLocalBounds();
        name.setOrigin(nb.left + nb.width * 0.5f, nb.top);
        name.setPosition(x + CARD_SIZE * 0.5f, y + CARD_SIZE + 8.f + lift);
        win.draw(name);

        if (isHovered) {
            sf::Text linkIcon;
            linkIcon.setFont(_font);
            linkIcon.setString("LinkedIn ->");
            linkIcon.setCharacterSize(10);
            linkIcon.setFillColor(sf::Color(0, 230, 210));
            auto lb = linkIcon.getLocalBounds();
            linkIcon.setOrigin(lb.left + lb.width * 0.5f, lb.top);
            linkIcon.setPosition(x + CARD_SIZE * 0.5f, y + CARD_SIZE + CARD_LABEL_H + 4.f + lift);
            win.draw(linkIcon);
        }
    }
}

void AboutScreen::drawHint(sf::RenderWindow &win)
{
    if (!_fontLoaded) return;

    sf::Text hint;
    hint.setFont(_font);
    hint.setString("Clic sur une photo : ouvrir le profil LinkedIn      Echap : retour");
    hint.setCharacterSize(11);
    hint.setFillColor(sf::Color(255, 255, 255, 90));
    auto b = hint.getLocalBounds();
    hint.setOrigin(b.left + b.width * 0.5f, b.top);
    hint.setPosition(WIN_W * 0.5f, WIN_H - 28.f);
    win.draw(hint);
}

void AboutScreen::run()
{
    _fontLoaded = loadFont();

    _description = loadDescription(DESCRIPTION_PATH);
    _descriptionLines = wrapText(_description, 14, DESC_W);

    loadContributorPhotos();

    sf::RenderWindow window(
        sf::VideoMode(WIN_W, WIN_H),
        "Zappy  –  A propos",
        sf::Style::Close
    );
    window.setFramerateLimit(60);
    window.setKeyRepeatEnabled(false);

    int hovered = -1;

    while (window.isOpen()) {
        sf::Event ev;
        while (window.pollEvent(ev)) {

            if (ev.type == sf::Event::Closed) {
                window.close();
                return;
            }

            if (ev.type == sf::Event::KeyPressed &&
                ev.key.code == sf::Keyboard::Escape) {
                window.close();
                return;
            }

            if (ev.type == sf::Event::MouseMoved) {
                hovered = hitContributor((float)ev.mouseMove.x,
                                         (float)ev.mouseMove.y);
            }

            if (ev.type == sf::Event::MouseButtonPressed &&
                ev.mouseButton.button == sf::Mouse::Left) {
                int idx = hitContributor((float)ev.mouseButton.x,
                                         (float)ev.mouseButton.y);
                if (idx >= 0)
                    openUrl(CONTRIBUTORS[idx].linkedinUrl);
            }
        }

        drawBackground(window);
        drawTitle(window);
        drawDescription(window);
        drawContributors(window, hovered);
        drawHint(window);

        window.display();
    }
}