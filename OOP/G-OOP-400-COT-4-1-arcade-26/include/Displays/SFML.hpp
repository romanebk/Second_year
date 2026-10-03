#ifndef SFML_HPP
#define SFML_HPP

#include "../ILibrary/IDisplay.hpp"
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <map>

class SFML : public IDisplay {
public:
    SFML();
    ~SFML() override;

    void init() override;
    void close() override;
    void clear() override;
    void display() override;
    void render(const std::vector<Entity>& entities) override;
    void renderHUD(const std::string& playerName, int score) override;
    void renderMenu(const std::vector<std::string>& g, const std::vector<std::string>& gr, const std::string& p, int s) override;
    void renderGameOver(int score) override;
    void renderSplash(const std::string& imagePath, const std::string& gameName) override;
    Event pollEvent() override;
    void playSound(const std::string& soundPath) override;
    std::string getName() const override;

private:
    sf::RenderWindow _window;
    sf::Font *_font;
    bool _fontLoaded;
    int _width, _height;
    std::map<std::string, sf::SoundBuffer> _soundBuffers;
    sf::Sound _sound;
};

extern "C" {
    IDisplay* createDisplay();
    void destroyDisplay(IDisplay* display);
}

#endif