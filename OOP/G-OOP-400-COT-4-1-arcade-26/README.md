# Arcade Platform

Arcade is a dynamic gaming platform that allows users to play various games using multiple graphical renderers. The core architecture is based on dynamic library loading, allowing for runtime switching of games and graphics.

---

## Quick Start

### 1. Build the project
```bash
make re
```

### 2. Run with a graphics library
```bash
./arcade ./lib/arcade_ncurses.so
```

---

## Features

- [x] Dynamic loading of graphics libraries (nCurses, SDL2, SFML)
- [x] Dynamic loading of games (Snake, Nibbler, Minesweeper)
- [x] Runtime switching of games and graphics
- [x] Generic library detection
- [x] Score management
- [x] Automatic dependency detection
