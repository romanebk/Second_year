
#include "../../include/Games/Nibbler.hpp"
#include <cstdlib>
#include <ctime>
#include <iostream>

using namespace NibblerNS;

namespace {

    struct Level {
        const char* map[20];
        int maxTime;
    };

    const Level LEVELS[] = {
        {
            {
                "####################",
                "#o                 #",
                "# #### ####### ### #",
                "# #              # #",
                "# # #### ##### # # #",
                "#o                 #",
                "#### ##      ### ###",
                "#    ##  o   ###   #",
                "# ######    ###### #",
                "#o                 #",
                "#                  #",
                "# ######    ###### #",
                "#    ##  o   ###   #",
                "#### ##      ### ###",
                "#                  #",
                "# # #### ##### # # #",
                "# #              # #",
                "# #### ####### ### #",
                "#o                o#",
                "####################"
            },
            700
        },
        {
            {
                "####################",
                "#o       #        o#",
                "# ###### # ####### #",
                "#                  #",
                "#### ###   ### #####",
                "#      #   #       #",
                "# #### ##### ####  #",
                "# #  #       #  #  #",
                "# #o # ##### # o#  #",
                "#    #       #     #",
                "# #### ##### ####  #",
                "# #  #       #  #  #",
                "# #  # ##### #  #  #",
                "#    #       #     #",
                "#### ###   ### #####",
                "#      #   #       #",
                "# ###### # ####### #",
                "#                  #",
                "#o       #        o#",
                "####################"
            },
            1000
        }
    };

    const int MAX_LEVELS = 2;

    
    bool isWallInLevel(int x, int y, int levelIdx) {
        if (x < 0 || x >= 20 || y < 0 || y >= 20) return true;
        return LEVELS[levelIdx].map[y][x] == '#';
    }

    Direction getLeftDir(Direction d) {
        if (d == Direction::UP)    return Direction::LEFT;
        if (d == Direction::LEFT)  return Direction::DOWN;
        if (d == Direction::DOWN)  return Direction::RIGHT;
        return Direction::UP;
    }

    Direction getRightDir(Direction d) {
        if (d == Direction::UP)    return Direction::RIGHT;
        if (d == Direction::RIGHT) return Direction::DOWN;
        if (d == Direction::DOWN)  return Direction::LEFT;
        return Direction::UP;
    }

    Position movePos(Position p, Direction d) {
        if (d == Direction::UP)    p.y--;
        else if (d == Direction::DOWN)  p.y++;
        else if (d == Direction::LEFT)  p.x--;
        else if (d == Direction::RIGHT) p.x++;
        return p;
    }

} 

extern "C" {
    IGame* createGame() { return new Nibbler(); }
    void destroyGame(IGame* game) { delete game; }
}

Nibbler::Nibbler() {
    std::srand(std::time(nullptr));
    init();
}

Nibbler::~Nibbler() {}

void Nibbler::init() {
    _width  = 20;
    _height = 20;
    _score  = 0;
    _gameOver = false;
    _isStarted = false;   
    _speedCounter = 0;
    _speedLimit   = 8;    
    _graceCount   = 0;

    _currentLevelIdx = 0;
    _loadLevel();

    
    _snake.clear();
    _snake.push_back({10, 18});
    _snake.push_back({ 9, 18});
    _snake.push_back({ 8, 18});
    _snake.push_back({ 7, 18});
    _direction = Direction::RIGHT;
}

void Nibbler::reset() { init(); }

void Nibbler::_loadLevel() {
    if (_currentLevelIdx >= MAX_LEVELS) _currentLevelIdx = 0;
    _timer = LEVELS[_currentLevelIdx].maxTime;
    _foods.clear();
    for (int y = 0; y < 20; y++) {
        for (int x = 0; x < 20; x++) {
            if (LEVELS[_currentLevelIdx].map[y][x] == 'o') {
                _foods.push_back({x, y});
            }
        }
    }
}

bool Nibbler::_isWall(int x, int y) const {
    return isWallInLevel(x, y, _currentLevelIdx);
}

void Nibbler::update() {
    if (_gameOver)    return;
    if (!_isStarted)  return;   

    
    _speedCounter++;
    if (_speedCounter < _speedLimit) return;
    _speedCounter = 0;

    
    if (_graceCount > 0) {
        _graceCount--;
        return;
    }

    
    if (_foods.empty()) {
        _currentLevelIdx++;
        _loadLevel();
        _snake.clear();
        _snake.push_back({10, 18});
        _snake.push_back({ 9, 18});
        _snake.push_back({ 8, 18});
        _snake.push_back({ 7, 18});
        _direction  = Direction::RIGHT;
        _graceCount = 8;
        return;
    }

    
    if (_timer > 0) {
        _timer--;
        if (_timer <= 0) {
            std::cerr << "Nibbler: Out of time!\n";
            _gameOver = true;
            _sounds.push_back("assets/sounds/die.wav");
            return;
        }
    }

    
    Position next = movePos(_snake.front(), _direction);

    
    if (_isWall(next.x, next.y)) {
        Direction lDir = getLeftDir(_direction);
        Direction rDir = getRightDir(_direction);
        Position  lPos = movePos(_snake.front(), lDir);
        Position  rPos = movePos(_snake.front(), rDir);

        bool lFree = !_isWall(lPos.x, lPos.y);
        bool rFree = !_isWall(rPos.x, rPos.y);

        if (lFree && !rFree) {
            _direction = lDir;
            next = lPos;
        } else if (rFree && !lFree) {
            _direction = rDir;
            next = rPos;
        } else {
            
            return;
        }
    }

    
    
    for (size_t i = 0; i < _snake.size() - 1; i++) {
        if (_snake[i].x == next.x && _snake[i].y == next.y) {
            std::cerr << "Nibbler: Self-collision at ("
                      << next.x << ", " << next.y << ")\n";
            _gameOver = true;
            _sounds.push_back("assets/sounds/die.wav");
            return;
        }
    }

    
    _snake.insert(_snake.begin(), next);

    
    bool ate = false;
    for (auto it = _foods.begin(); it != _foods.end(); ++it) {
        if (it->x == next.x && it->y == next.y) {
            _score += 100;
            _foods.erase(it);
            _sounds.push_back("assets/sounds/eat.wav");
            ate = true;
            break;
        }
    }

    if (!ate) {
        _snake.pop_back();
    }
}

void Nibbler::handleEvent(Event event) {
    
    if (event == Event::UP || event == Event::DOWN ||
        event == Event::LEFT || event == Event::RIGHT) {
        if (!_isStarted) _sounds.push_back("assets/sounds/select.wav");
        _isStarted = true;
    }

    
    if (event == Event::UP    && _direction != Direction::DOWN)
        _direction = Direction::UP;
    if (event == Event::DOWN  && _direction != Direction::UP)
        _direction = Direction::DOWN;
    if (event == Event::LEFT  && _direction != Direction::RIGHT)
        _direction = Direction::LEFT;
    if (event == Event::RIGHT && _direction != Direction::LEFT)
        _direction = Direction::RIGHT;
}

std::vector<Entity> Nibbler::getEntities() const {
    std::vector<Entity> entities;

    
    for (int y = 0; y < _height; y++) {
        for (int x = 0; x < _width; x++) {
            if (_isWall(x, y))
                entities.push_back({x, y, EntityType::WALL, '#', 4, ""});
        }
    }

    
    for (const auto& fp : _foods) {
        entities.push_back({fp.x, fp.y, EntityType::FOOD, 'o', 1, ""});
    }

    for (size_t i = 0; i < _snake.size(); i++) {
        EntityType t  = (i == 0) ? EntityType::SNAKE_HEAD : EntityType::SNAKE_BODY;
        char       ch = (i == 0) ? 'O' : 'o';
        int color = (i == 0) ? 3 : 2;
        entities.push_back({_snake[i].x, _snake[i].y, t, ch, color, ""});
    }

    return entities;
}

void Nibbler::spawnFood() {  }

std::pair<int, int> Nibbler::getMapSize() const { return {_width, _height}; }
int  Nibbler::getScore()   const { return _score; }
bool Nibbler::isGameOver() const { return _gameOver; }
std::string Nibbler::getName() const { return "Nibbler"; }

std::vector<std::string> Nibbler::getSounds() {
    std::vector<std::string> sounds = _sounds;
    _sounds.clear();
    return sounds;
}
