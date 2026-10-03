#include "../../include/Displays/SFML.hpp"

extern "C" {
    IDisplay* createDisplay() { return new SFML(); }
    void destroyDisplay(IDisplay* display) { delete display; }
}

SFML::SFML() : _font(nullptr), _fontLoaded(false), _width(800), _height(600) {}
SFML::~SFML() { close(); }

void SFML::init() {
    // Libérer la police précédente si init() est rappelée
    if (_font) {
        delete _font;
        _font = nullptr;
        _fontLoaded = false;
    }
    _window.create(sf::VideoMode(_width, _height), "SFML Arcade Games");

    _font = new sf::Font();
    if (_font->loadFromFile("./ProductSans-Black.ttf")) {
        _fontLoaded = true;
    } else {
        delete _font;
        _font = nullptr;
    }
}
void SFML::close() {
    if (_window.isOpen()) _window.close();
    // Libérer la police pour éviter le use-after-free quand la lib est déchargée
    if (_font) {
        delete _font;
        _font = nullptr;
        _fontLoaded = false;
    }
    _soundBuffers.clear();
}
void SFML::clear() { _window.clear(sf::Color::Black); }
void SFML::display() { _window.display(); }

void SFML::render(const std::vector<Entity>& entities) {
    for (const auto& e : entities) {
        float x = (float)e.x * 24.f + 50.f;
        float y = (float)e.y * 24.f + 50.f;

        if (e.type == EntityType::WALL) {
            sf::RectangleShape r(sf::Vector2f(22, 22));
            r.setPosition(x, y);
            r.setFillColor(sf::Color(60, 64, 80));
            r.setOutlineThickness(1);
            r.setOutlineColor(sf::Color(100, 100, 150));
            _window.draw(r);
        } else if (e.type == EntityType::SNAKE_HEAD) {
            sf::RectangleShape r(sf::Vector2f(22, 22));
            r.setPosition(x, y);
            r.setFillColor(sf::Color::Green);
            _window.draw(r);
            
            sf::CircleShape eye(2);
            eye.setFillColor(sf::Color::Black);
            eye.setPosition(x + 4, y + 4);
            _window.draw(eye);
            eye.setPosition(x + 14, y + 4);
            _window.draw(eye);
        } else if (e.type == EntityType::SNAKE_BODY) {
            sf::CircleShape c(10);
            c.setPosition(x + 1, y + 1);
            c.setFillColor(sf::Color(0, 180, 0));
            _window.draw(c);
        } else if (e.type == EntityType::FOOD) {
            sf::CircleShape c(9);
            c.setPosition(x + 2, y + 2);
            c.setFillColor(sf::Color::Red);
            c.setOutlineThickness(2);
            c.setOutlineColor(sf::Color(255, 100, 100));
            _window.draw(c);
        } else if (e.type == EntityType::HIDDEN) {
            sf::RectangleShape r(sf::Vector2f(22, 22));
            r.setPosition(x, y);
            r.setFillColor(sf::Color(50, 50, 50));
            _window.draw(r);
        } else if (e.type == EntityType::FLAG) {
            sf::CircleShape t(8, 3);
            t.setPosition(x + 3, y + 3);
            t.setFillColor(sf::Color::Yellow);
            _window.draw(t);
        } else if (e.type == EntityType::MINE) {
            sf::CircleShape m(8);
            m.setPosition(x + 3, y + 3);
            m.setFillColor(sf::Color::Red);
            _window.draw(m);
        } else if (e.type == EntityType::REVEALED || e.type == EntityType::NUMBER) {
            sf::RectangleShape r(sf::Vector2f(22, 22));
            r.setPosition(x, y);
            r.setFillColor(sf::Color(200, 200, 200));
            _window.draw(r);
            if (e.type == EntityType::NUMBER && _fontLoaded) {
                sf::Text txt(std::string(1, e.symbol), *_font, 18);
                txt.setPosition(x + 6, y);
                txt.setFillColor(sf::Color::Blue);
                _window.draw(txt);
            }
        } else if (e.type == EntityType::CURSOR) {
            sf::RectangleShape r(sf::Vector2f(22, 22));
            r.setPosition(x, y);
            r.setFillColor(sf::Color::Transparent);
            r.setOutlineThickness(2);
            r.setOutlineColor(sf::Color::White);
            _window.draw(r);
        } else {
            sf::RectangleShape r(sf::Vector2f(20, 20));
            r.setPosition(x, y);
            r.setFillColor(sf::Color::White);
            _window.draw(r);
        }
    }
}

void SFML::renderHUD(const std::string& p, int s) {
    if (!_fontLoaded || !_font) return;
    
    sf::RectangleShape bar(sf::Vector2f(800, 40));
    bar.setFillColor(sf::Color(40, 40, 40, 200));
    _window.draw(bar);

    sf::Text text;
    text.setFont(*_font);
    text.setCharacterSize(20);
    text.setFillColor(sf::Color::White);
    text.setString("Player: " + p + " | Score: " + std::to_string(s));
    text.setPosition(20, 8);
    _window.draw(text);
}

void SFML::renderMenu(const std::vector<std::string>& games,
                      const std::vector<std::string>& graphics,
                      const std::string& playerName, int score)
{
    
    sf::RectangleShape bg(sf::Vector2f(800, 600));
    bg.setFillColor(sf::Color(20, 22, 28));
    _window.draw(bg);

    if (!_fontLoaded || !_font) return;

    
    sf::Text header("ARCADE LIBLOADER", *_font, 40);
    header.setFillColor(sf::Color(100, 150, 255));
    header.setStyle(sf::Text::Bold);
    header.setPosition(220, 40);
    _window.draw(header);

    sf::Text playerInfo("Player: " + playerName + " | Score: " + std::to_string(score), *_font, 20);
    playerInfo.setPosition(50, 110);
    _window.draw(playerInfo);

    
    sf::Text gamesLabel("GAMES", *_font, 24);
    gamesLabel.setPosition(150, 160);
    _window.draw(gamesLabel);

    sf::Text graphicsLabel("GRAPHICS", *_font, 24);
    graphicsLabel.setPosition(540, 160);
    _window.draw(graphicsLabel);

    
    for (size_t i = 0; i < games.size(); i++) {
        sf::RectangleShape item(sf::Vector2f(300, 35));
        item.setPosition(50, 200 + (float)i * 45);
        item.setFillColor(sf::Color(40, 44, 52));
        item.setOutlineThickness(1);
        item.setOutlineColor(sf::Color(100, 100, 100));
        _window.draw(item);

        sf::Text txt(games[i], *_font, 18);
        txt.setPosition(65, 205 + (float)i * 45);
        _window.draw(txt);
    }

    for (size_t i = 0; i < graphics.size(); i++) {
        sf::RectangleShape item(sf::Vector2f(300, 35));
        item.setPosition(450, 200 + (float)i * 45);
        item.setFillColor(sf::Color(40, 44, 52));
        item.setOutlineThickness(1);
        item.setOutlineColor(sf::Color(100, 100, 100));
        _window.draw(item);

        sf::Text txt(graphics[i], *_font, 18);
        txt.setPosition(465, 205 + (float)i * 45);
        _window.draw(txt);
    }

    sf::Text footer("Arrows: Navigate | Enter: Play | ESC: Exit | 2/3: Libs | 4/5: Games", *_font, 16);
    footer.setPosition(150, 560);
    footer.setFillColor(sf::Color(150, 150, 150));
    _window.draw(footer);
}

Event SFML::pollEvent() {
    sf::Event e;
    while (_window.pollEvent(e)) {
        if (e.type == sf::Event::Closed) return Event::EXIT;
        if (e.type == sf::Event::KeyPressed) {
            if (e.key.code == sf::Keyboard::Up)     return Event::UP;
            if (e.key.code == sf::Keyboard::Down)   return Event::DOWN;
            if (e.key.code == sf::Keyboard::Left)   return Event::LEFT;
            if (e.key.code == sf::Keyboard::Right)  return Event::RIGHT;
            if (e.key.code == sf::Keyboard::Escape) return Event::EXIT;
            if (e.key.code == sf::Keyboard::Enter)  return Event::ACTION;
            if (e.key.code == sf::Keyboard::BackSpace) return Event::BACKSPACE;
            if (e.key.code == sf::Keyboard::Space)  return Event::SPACE;
            if (e.key.code == sf::Keyboard::Num2)   return Event::PREV_LIB;
            if (e.key.code == sf::Keyboard::Num3)   return Event::NEXT_LIB;
            if (e.key.code == sf::Keyboard::Num4)   return Event::PREV_GAME;
            if (e.key.code == sf::Keyboard::Num5)   return Event::NEXT_GAME;
            if (e.key.code == sf::Keyboard::Num8)   return Event::RESTART;
            if (e.key.code == sf::Keyboard::Num9)   return Event::MENU;
            
            
            if (e.key.code >= sf::Keyboard::A && e.key.code <= sf::Keyboard::Z)
                return static_cast<Event>(static_cast<int>(Event::KEY_A) + (e.key.code - sf::Keyboard::A));
            if (e.key.code >= sf::Keyboard::Num0 && e.key.code <= sf::Keyboard::Num9)
                return static_cast<Event>(static_cast<int>(Event::KEY_0) + (e.key.code - sf::Keyboard::Num0));
        }
    }
    return Event::UNKNOWN;
}

void SFML::renderGameOver(int score)
{
    sf::RectangleShape overlay(sf::Vector2f(800, 600));
    overlay.setFillColor(sf::Color(0, 0, 0, 150));
    _window.draw(overlay);

    if (_fontLoaded && _font) {
        sf::Text goText("GAME OVER", *_font, 60);
        goText.setFillColor(sf::Color::Red);
        goText.setOutlineColor(sf::Color::White);
        goText.setOutlineThickness(2);
        goText.setPosition(250, 200);
        _window.draw(goText);

        sf::Text scText("Score: " + std::to_string(score), *_font, 30);
        scText.setFillColor(sf::Color::White);
        scText.setPosition(350, 300);
        _window.draw(scText);

        sf::Text insText("Press ENTER to return to Menu", *_font, 20);
        insText.setFillColor(sf::Color::White);
        insText.setPosition(250, 450);
        _window.draw(insText);
    }
}

void SFML::renderSplash(const std::string& imagePath, const std::string& gameName)
{
    sf::Texture splashTex;
    if (!splashTex.loadFromFile(imagePath)) {
        
        renderGameOver(0); 
        return;
    }

    sf::Sprite sprite(splashTex);
    sf::FloatRect bounds = sprite.getLocalBounds();
    sprite.setScale(800.f / bounds.width, 600.f / bounds.height);
    _window.draw(sprite);

    if (_fontLoaded && _font) {
        sf::RectangleShape box(sf::Vector2f(400, 60));
        box.setFillColor(sf::Color(0, 0, 0, 180));
        box.setPosition(200, 500);
        _window.draw(box);

        sf::Text text("Starting " + gameName + "...", *_font, 30);
        text.setFillColor(sf::Color::White);
        text.setPosition(220, 510);
        _window.draw(text);
    }
}

void SFML::playSound(const std::string& soundPath) {
    if (_soundBuffers.find(soundPath) == _soundBuffers.end()) {
        sf::SoundBuffer buffer;
        if (!buffer.loadFromFile(soundPath)) {
            return;
        }
        _soundBuffers[soundPath] = buffer;
    }
    _sound.setBuffer(_soundBuffers[soundPath]);
    _sound.play();
}

std::string SFML::getName() const { return "SFML"; }