
#ifndef SNAKE_HPP
#define SNAKE_HPP

#include "../ILibrary/IGame.hpp"
#include <vector>
#include <string>

enum class Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

struct Position {
    int x;
    int y;

    bool operator==(const Position& other) const {
        return x == other.x && y == other.y;
    }
};

class Snake : public IGame {
public:
    Snake(int width, int height, bool cyclic = false);
    ~Snake() override = default;

    
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
    std::vector<std::string> _sounds;
    int _width;
    int _height;
    bool _cyclic;

    std::vector<Position> _body; 
    Direction _direction;
    Direction _nextDirection;
    Position _food;
    int _score;
    bool _gameOver;
    bool _isStarted;
    int _speedCounter;
    int _speedLimit;

    void _spawnFood();
    bool _isOnSnake(const Position& pos) const;
    Position _nextHead() const;
};

#endif
