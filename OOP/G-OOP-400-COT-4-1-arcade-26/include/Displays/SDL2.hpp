#ifndef SDL2_HPP
#define SDL2_HPP

#include "../ILibrary/IDisplay.hpp"
#include <SDL2/SDL.h>
#include <SDL2/SDL_ttf.h>

class SDL2 : public IDisplay {
public:
    SDL2();
    ~SDL2() override;

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
    SDL_Window* _window;
    SDL_Renderer* _renderer;
    int _width, _height;
    TTF_Font* _font;
    bool _fontLoaded;
};

extern "C" {
    IDisplay* createDisplay();
    void destroyDisplay(IDisplay* display);
}

#endif