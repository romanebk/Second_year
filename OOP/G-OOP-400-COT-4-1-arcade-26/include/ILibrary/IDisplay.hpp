
#ifndef IDISPLAY_HPP
#define IDISPLAY_HPP

#include "Common.hpp"
#include <string>
#include <vector>

class IDisplay {
public:
    virtual ~IDisplay() = default;

    

    
    virtual void init() = 0;

    
    virtual void close() = 0;

    
    virtual void clear() = 0;

    
    virtual void display() = 0;

    

    
    virtual void render(const std::vector<Entity>& entities) = 0;

    
    virtual void renderHUD(const std::string& playerName, int score) = 0;

    
    virtual void renderMenu(
        const std::vector<std::string>& games,
        const std::vector<std::string>& graphics,
        const std::string& playerName,
        int score
    ) = 0;

    virtual void renderGameOver(int score) = 0;
    virtual void renderSplash(const std::string& imagePath, const std::string& gameName) = 0;

    

    
    virtual Event pollEvent() = 0;

    
    virtual void playSound(const std::string& soundPath) = 0;

    
    virtual std::string getName() const = 0;
};





#endif 