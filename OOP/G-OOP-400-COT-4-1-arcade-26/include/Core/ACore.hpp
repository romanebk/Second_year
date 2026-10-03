
#ifndef ACORE_HPP
#define ACORE_HPP

#include <string>
#include <vector>
#include <memory>
#include <chrono>
#include "ICore.hpp"
#include "../Error.hpp"
#include "./DLLoader.hpp"

class Core : public ICore {
    public:
        Core(const std::string &initlib);
        ~Core();
        void run() override;
        void loadDisplay(const std::string &path) override;
        void loadGame(const std::string &path) override;
        void nextDisplay() override;
        void prevDisplay() override;
        void nextGame() override;
        void prevGame() override;
        void restartGame() override;
        void goToMenu() override;
        std::vector<std::string> getAvailableDisplays() const override;
        std::vector<std::string> getAvailableGames() const override;
        std::string getPlayerName() const override;
        void setPlayerName(const std::string &name) override;
        int getScore() const override;
    
    private:
        IDisplay *_display;
        IGame *_game;
        DLLoader<IDisplay> *_displayLoader;
        DLLoader<IGame> *_gameLoader;

        std::vector<std::string> _libdisplay;
        std::vector<std::string> _libgame;
        
        std::size_t currentDisplayIndex;
        std::size_t currentGameIndex;

        enum class CoreState {
            MENU,
            PLAYING,
            GAME_OVER,
            SPLASH
        };

        CoreState _state;
        bool isRunning;
        
        std::chrono::steady_clock::time_point _splashStartTime;
        std::string _splashGameName;
        std::string _splashImagePath;
        
        int _currentscore;
        std::string _playername;
        
        std::string _initlib;
        
        void scanLibFolder();
        void handleGameLogic(Event event);
        void handleMenuLogic(Event event);
};

#endif