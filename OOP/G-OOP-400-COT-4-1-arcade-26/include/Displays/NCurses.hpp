#ifndef NCURSES_HPP
#define NCURSES_HPP

#include "../ILibrary/IDisplay.hpp"
#include <ncurses.h>

class NCurses : public IDisplay {
public:
    NCurses();
    ~NCurses() override;

    void init() override;
    void close() override;
    void clear() override;
    void display() override;
    void render(const std::vector<Entity>& entities) override;
    void renderHUD(const std::string& playerName, int score) override;
    void renderMenu(const std::vector<std::string>& games, const std::vector<std::string>& graphics, const std::string& playerName, int score) override;
    void renderGameOver(int score) override;
    void renderSplash(const std::string& imagePath, const std::string& gameName) override;
    Event pollEvent() override;
    void playSound(const std::string& soundPath) override;
    std::string getName() const override;

private:
    void _drawGameBorder(int gameWidth, int gameHeight);
    int _width;
    int _height;
};

extern "C" {
    IDisplay* createDisplay();
    void destroyDisplay(IDisplay* display);
}

#endif