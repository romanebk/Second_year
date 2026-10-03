
#ifndef MINESWEEPER_HPP
#define MINESWEEPER_HPP

#include "../ILibrary/IGame.hpp"
#include <vector>
#include <string>

namespace MinesweeperNS {
    struct Cell {
        bool isMine = false;
        bool isRevealed = false;
        bool isFlagged = false;
        int neighborMines = 0;
    };
}

class Minesweeper : public IGame {
public:
    Minesweeper();
    ~Minesweeper();

    void update() override;
    void handleEvent(Event event) override;
    void reset() override;

    std::vector<Entity> getEntities() const override;
    std::pair<int, int> getMapSize() const override;
    int getScore() const override;
    bool isGameOver() const override;
    std::string getName() const override;
    std::vector<std::string> getSounds() override;

private:
    void _initBoard();
    void _reveal(int x, int y);
    void _checkWin();
    bool _isValid(int x, int y) const;

    int _width;
    int _height;
    int _score;
    bool _gameOver;
    bool _win;
    bool _isStarted;
    
    int _cursorX;
    int _cursorY;
    
    std::vector<std::vector<MinesweeperNS::Cell>> _board;
    std::vector<std::string> _sounds;
    std::string _splashImagePath;
};

#endif
