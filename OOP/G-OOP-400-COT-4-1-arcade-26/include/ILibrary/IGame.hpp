
#ifndef IGAME_HPP
#define IGAME_HPP

#include "Common.hpp"
#include <vector>
#include <string>

class IGame {
public:
    virtual ~IGame() = default;

    
    
    
    virtual void update() = 0;

    
    virtual void handleEvent(Event event) = 0;

    
    virtual void reset() = 0;

    

    
    virtual std::vector<Entity> getEntities() const = 0;

    
    
    virtual std::pair<int, int> getMapSize() const = 0;

    virtual int getScore() const = 0;
    virtual bool isGameOver() const = 0;
    virtual std::vector<std::string> getSounds() = 0;
    virtual std::string getName() const = 0;
};





#endif 