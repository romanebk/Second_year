
#ifndef NIBBLER_HPP
#define NIBBLER_HPP

#include "../ILibrary/IGame.hpp"
#include <vector>

namespace NibblerNS {
    enum class Direction { UP, DOWN, LEFT, RIGHT };

    struct Position {
        int x;
        int y;
    };
}

class Nibbler : public IGame {
public:
    Nibbler();
    ~Nibbler() override;

    void update() override;
    void handleEvent(Event event) override;
    void reset() override;

    std::vector<Entity> getEntities() const override;
    std::pair<int, int> getMapSize() const override;
    int getScore() const override;
    bool isGameOver() const override;
    std::vector<std::string> getSounds() override;
    std::string getName() const override;

private:
    void init();
    void spawnFood();        
    void _loadLevel();
    bool _isWall(int x, int y) const;

    std::vector<NibblerNS::Position> _snake;
    std::vector<NibblerNS::Position> _foods; 
    NibblerNS::Direction _direction;

    int  _score;
    bool _gameOver;
    bool _isStarted;
    int  _speedCounter;
    int  _speedLimit;
    int  _graceCount;
    int  _timer;            
    int  _currentLevelIdx;  

    int _width;
    int _height;
    std::vector<std::string> _sounds;
};

extern "C" {
    IGame* createGame();
    void destroyGame(IGame* game);
}

#endif

