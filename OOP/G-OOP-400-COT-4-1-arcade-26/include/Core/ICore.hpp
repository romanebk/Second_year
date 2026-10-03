
#ifndef ICORE_HPP
#define ICORE_HPP

#include "../ILibrary/IGame.hpp"
#include "../ILibrary/IDisplay.hpp"
#include <string>
#include <vector>
#include <sys/types.h>
#include <dirent.h>
#include <algorithm>

class ICore {
public:
    virtual ~ICore() = default;
    virtual void run() = 0;
    virtual void loadDisplay(const std::string& path) = 0;
    virtual void loadGame(const std::string& path) = 0;
    virtual void nextDisplay() = 0;
    virtual void prevDisplay() = 0;
    virtual void nextGame() = 0;
    virtual void prevGame() = 0;
    virtual void restartGame() = 0;
    virtual void goToMenu() = 0;
    virtual std::vector<std::string> getAvailableDisplays() const = 0;
    virtual std::vector<std::string> getAvailableGames() const = 0;
    virtual std::string getPlayerName() const = 0;
    virtual void setPlayerName(const std::string& name) = 0;
    virtual int getScore() const = 0;
};

#endif