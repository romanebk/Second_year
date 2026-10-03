#include "../../include/Games/Snake.hpp"
#include <cstdlib>
#include <ctime>

Snake::Snake(int width, int height, bool cyclic)
    : _width(width), _height(height), _cyclic(cyclic),
      _direction(Direction::RIGHT), _nextDirection(Direction::RIGHT),
      _score(0), _gameOver(false), _isStarted(false), _speedCounter(0), _speedLimit(7)
{
    std::srand(std::time(nullptr));
    reset();
}

void Snake::update()
{
    if (_gameOver == true || _isStarted == false)
        return;
    _speedCounter++;
    if (_speedCounter < _speedLimit)
        return;
    _speedCounter = 0;
    _direction = _nextDirection;
    Position head = _nextHead();

    if (_cyclic == false) {
        if (head.x < 0 || head.x >= _width ||
            head.y < 0 || head.y >= _height) {
            _gameOver = true;
            _sounds.push_back("assets/sounds/die.wav");
            return;
        }
    } else {
        if (head.x < 0) head.x = _width - 1;
        if (head.x >= _width) head.x = 0;
        if (head.y < 0) head.y = _height - 1;
        if (head.y >= _height) head.y = 0;
    }
    
    bool willEat = (head == _food);
    for (std::size_t i = 0; i < _body.size() - 1; i++) {
        if (_body[i] == head) {
            if (i == _body.size() - 1 && !willEat)
                continue;
            _gameOver = true;
            _sounds.push_back("assets/sounds/die.wav");
            return;
        }
    }
    _body.insert(_body.begin(), head);

    if (head == _food) {
        _score += 10;
        _sounds.push_back("assets/sounds/eat.wav");
        _spawnFood();
    } else {
        _body.pop_back();
    }
    if (_body.size() == static_cast<std::size_t>(_width * _height)) {
        _gameOver = true;
    }
}

void Snake::handleEvent(Event event)
{
    if (event == Event::UP || event == Event::DOWN || event == Event::LEFT || event == Event::RIGHT) {
        if (_isStarted == false)
            _isStarted = true;
    }
    switch (event) {
        case Event::UP:
            if (_direction != Direction::DOWN)
                _nextDirection = Direction::UP;
            break;
        case Event::DOWN:
            if (_direction != Direction::UP)
                _nextDirection = Direction::DOWN;
            break;
        case Event::LEFT:
            if (_direction != Direction::RIGHT)
                _nextDirection = Direction::LEFT;
            break;
        case Event::RIGHT:
            if (_direction != Direction::LEFT)
                _nextDirection = Direction::RIGHT;
            break;
        default:
            break;
    }
}

void Snake::reset()
{
    _body.clear();
    _direction = Direction::RIGHT;
    _nextDirection = Direction::RIGHT;
    _score = 0;
    _gameOver = false;
    _isStarted = false;
    _speedCounter = 0;
    _speedLimit = 10;
    _sounds.clear();
    
    int startX = _width / 2;
    int startY = _height / 2;
    for (int i = 0; i < 4; i++)
        _body.push_back({startX - i, startY});
    _spawnFood();
}

std::vector<Entity> Snake::getEntities() const
{
    std::vector<Entity> entities;

    for (std::size_t i = 0; i < _body.size(); i++) {
        Entity e;
        e.x = _body[i].x;
        e.y = _body[i].y;
        e.color = 2; 
        e.text = "";
        if (i == 0) {
            e.type = EntityType::SNAKE_HEAD;
            e.symbol = '@';
            e.color = 3; 
        } else {
            e.type = EntityType::SNAKE_BODY;
            e.symbol = 'O';
            e.color = 2; 
        }
        entities.push_back(e);
    }

    Entity food;
    food.x = _food.x;
    food.y = _food.y;
    food.type = EntityType::FOOD;
    food.symbol = '*';
    food.color = 1; 
    food.text = "";
    entities.push_back(food);
    return entities;
}

std::pair<int, int> Snake::getMapSize() const
{
    return {_width, _height};
}

int Snake::getScore() const
{
    return _score;
}

bool Snake::isGameOver() const
{
    return _gameOver;
}

std::string Snake::getName() const
{
    return "Snake";
}

std::vector<std::string> Snake::getSounds()
{
    std::vector<std::string> sounds = _sounds;
    _sounds.clear();
    return sounds;
}

void Snake::_spawnFood()
{
    Position pos;
    const int maxAttempts = _width * _height;
    
    for (int attempts = 0; attempts < maxAttempts; attempts++) {
        pos.x = std::rand() % _width;
        pos.y = std::rand() % _height;
        if (_isOnSnake(pos) == false) {
            _food = pos;
            return;
        }
    }
    _gameOver = true;
}

bool Snake::_isOnSnake(const Position& pos) const
{
    for (const auto& segment : _body) {
        if (segment == pos)
            return true;
    }
    return false;
}

Position Snake::_nextHead() const
{
    Position head = _body.front();
    switch (_direction) {
        case Direction::UP:    head.y -= 1; break;
        case Direction::DOWN:  head.y += 1; break;
        case Direction::LEFT:  head.x -= 1; break;
        case Direction::RIGHT: head.x += 1; break;
    }
    return head;
}

extern "C" IGame* createGame()
{
    return new Snake(30, 20, false);
}

extern "C" void destroyGame(IGame* game)
{
    delete game;
}
