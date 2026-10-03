
#include "../../include/Games/Minesweeper.hpp"
#include <cstdlib>
#include <ctime>
#include <algorithm>

Minesweeper::Minesweeper() : _width(15), _height(15), _score(0), _gameOver(false), _win(false), _isStarted(false), _cursorX(7), _cursorY(7)
{
    std::srand(std::time(nullptr));
    _splashImagePath = "images/minesweeper.jpg";
    reset();
}

Minesweeper::~Minesweeper() {}

void Minesweeper::reset()
{
    _gameOver = false;
    _win = false;
    _isStarted = false;
    _score = 0;
    _cursorX = _width / 2;
    _cursorY = _height / 2;
    _initBoard();
    _sounds.clear();
}

void Minesweeper::_initBoard()
{
    _board.assign(_height, std::vector<MinesweeperNS::Cell>(_width));
    
    int minesPlaced = 0;
    while (minesPlaced < 30) {
        int rx = std::rand() % _width;
        int ry = std::rand() % _height;
        if (!_board[ry][rx].isMine) {
            _board[ry][rx].isMine = true;
            minesPlaced++;
        }
    }
    
    for (int y = 0; y < _height; y++) {
        for (int x = 0; x < _width; x++) {
            if (_board[y][x].isMine) continue;
            int count = 0;
            for (int dy = -1; dy <= 1; dy++) {
                for (int dx = -1; dx <= 1; dx++) {
                    if (dx == 0 && dy == 0) continue;
                    if (_isValid(x + dx, y + dy) && _board[y + dy][x + dx].isMine)
                        count++;
                }
            }
            _board[y][x].neighborMines = count;
        }
    }
}

bool Minesweeper::_isValid(int x, int y) const
{
    return x >= 0 && x < _width && y >= 0 && y < _height;
}

void Minesweeper::update() {}

void Minesweeper::handleEvent(Event event)
{
    if (_gameOver || _win) return;
    _isStarted = true;

    switch (event) {
        case Event::UP:    if (_cursorY > 0) _cursorY--; break;
        case Event::DOWN:  if (_cursorY < _height - 1) _cursorY++; break;
        case Event::LEFT:  if (_cursorX > 0) _cursorX--; break;
        case Event::RIGHT: if (_cursorX < _width - 1) _cursorX++; break;
        case Event::ACTION:
            _reveal(_cursorX, _cursorY);
            break;
        case Event::SPACE:
            if (!_board[_cursorY][_cursorX].isRevealed) {
                _board[_cursorY][_cursorX].isFlagged = !_board[_cursorY][_cursorX].isFlagged;
                _sounds.push_back("assets/sounds/select.wav");
            }
            break;
        default: break;
    }
}

void Minesweeper::_reveal(int x, int y)
{
    if (!_isValid(x, y) || _board[y][x].isRevealed || _board[y][x].isFlagged)
        return;
    
    _board[y][x].isRevealed = true;
    _sounds.push_back("assets/sounds/select.wav");
    
    if (_board[y][x].isMine) {
        _gameOver = true;
        _sounds.push_back("assets/sounds/die.wav");
        return;
    }
    
    _score += 10;
    
    if (_board[y][x].neighborMines == 0) {
        for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
                if (dx != 0 || dy != 0)
                    _reveal(x + dx, y + dy);
            }
        }
    }
    _checkWin();
}

void Minesweeper::_checkWin()
{
    for (int y = 0; y < _height; y++) {
        for (int x = 0; x < _width; x++) {
            if (!_board[y][x].isMine && !_board[y][x].isRevealed)
                return;
        }
    }
    _win = true;
    _sounds.push_back("assets/sounds/eat.wav");
}

std::vector<Entity> Minesweeper::getEntities() const
{
    std::vector<Entity> entities;
    
    for (int y = 0; y < _height; y++) {
        for (int x = 0; x < _width; x++) {
            Entity e;
            e.x = x;
            e.y = y;
            e.text = "";
            const auto& cell = _board[y][x];
            
            if (cell.isFlagged) {
                e.type = EntityType::FLAG;
                e.symbol = 'P';
            } else if (!cell.isRevealed) {
                e.type = EntityType::HIDDEN;
                e.symbol = '.';
            } else if (cell.isMine) {
                e.type = EntityType::MINE;
                e.symbol = '*';
            } else {
                e.type = EntityType::REVEALED;
                if (cell.neighborMines > 0) {
                    e.type = EntityType::NUMBER;
                    e.symbol = '0' + cell.neighborMines;
                    e.color = (cell.neighborMines == 1) ? 2 : (cell.neighborMines == 2 ? 3 : 1);
                } else {
                    e.symbol = ' ';
                }
            }
            entities.push_back(e);
        }
    }
    
    Entity cursor;
    cursor.x = _cursorX;
    cursor.y = _cursorY;
    cursor.type = EntityType::CURSOR;
    cursor.symbol = 'X';
    entities.push_back(cursor);

    return entities;
}

std::pair<int, int> Minesweeper::getMapSize() const { return {_width, _height}; }
int Minesweeper::getScore() const { return _score; }
bool Minesweeper::isGameOver() const { return _gameOver || _win; }
std::string Minesweeper::getName() const { return "Minesweeper"; }
std::vector<std::string> Minesweeper::getSounds() {
    auto s = _sounds;
    _sounds.clear();
    return s;
}

extern "C" IGame* createGame() { return new Minesweeper(); }
extern "C" void destroyGame(IGame* game) { delete game; }
