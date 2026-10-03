# Arcade — Plugin Developer Guide

> **Version:** 1.0 — April 2026  
> **Scope:** How to implement new graphics libraries or game libraries compatible with the Arcade platform.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Project Architecture](#2-project-architecture)
3. [Shared Data Types — `Common.hpp`](#3-shared-data-types--commonhpp)
4. [Implementing a Graphics Library (`IDisplay`)](#4-implementing-a-graphics-library-idisplay)
5. [Implementing a Game Library (`IGame`)](#5-implementing-a-game-library-igame)
6. [Dynamic Loading Contract](#6-dynamic-loading-contract)
7. [Building Your Plugin](#7-building-your-plugin)
8. [Integration Checklist](#8-integration-checklist)
9. [Key Bindings Reference](#9-key-bindings-reference)

---

## 1. Overview

Arcade is a dynamic gaming platform. Every graphics renderer and every game is a **shared library (`.so`)** discovered at runtime from the `./lib/` directory. The core program (`arcade`) never links against your library at compile time — it uses `dlopen`, `dlsym`, and `dlclose` to load and call your code.

```
┌───────────────────────────────────────┐
│              arcade (core)            │
│   ┌──────────┐   ┌────────────────┐  │
│   │  ICore   │   │   DLLoader<T>  │  │
│   └────┬─────┘   └───────┬────────┘  │
│        │ manages         │ dlopen/sym│
└────────┼─────────────────┼───────────┘
         │                 │
    ┌────▼────┐       ┌────▼────┐
    │ IDisplay│       │  IGame  │
    │  .so    │       │  .so    │
    └─────────┘       └─────────┘
```

**Golden rules:**
- A graphics library **must not** contain any game logic.
- A game library **must not** perform any rendering or handle low-level events.
- Running `ldd ./arcade` must **not** list your library as a dependency.

---

## 2. Project Architecture

```
.
├── arcade                  ← Core executable
├── lib/                    ← All plugin .so files go here
│   ├── arcade_ncurses.so
│   ├── arcade_sdl2.so
│   ├── arcade_sfml.so
│   ├── arcade_snake.so
│   ├── arcade_nibbler.so
│   └── arcade_minesweeper.so
├── include/
│   ├── ILibrary/
│   │   ├── Common.hpp      ← Shared types (Entity, Event, EntityType)
│   │   ├── IDisplay.hpp    ← Graphics library interface
│   │   └── IGame.hpp       ← Game library interface
│   ├── Core/
│   │   ├── ICore.hpp       ← Core interface
│   │   ├── ACore.hpp       ← Core implementation header
│   │   └── DLLoader.hpp    ← Generic dynamic loader (template)
│   └── Error.hpp           ← Exception class
└── src/
    ├── main.cpp
    ├── Core/Core.cpp
    ├── Displays/           ← Graphics library sources
    └── Games/              ← Game library sources
```

---

## 3. Shared Data Types — `Common.hpp`

All plugins share these types, defined in `include/ILibrary/Common.hpp`. **Do not redefine them.**

### 3.1 `Event` — Input Events

The core translates raw keyboard input into generic `Event` values and passes them to both the display and game layers.

| Event value   | Meaning                          |
|---------------|----------------------------------|
| `UNKNOWN`     | Unrecognized / no input          |
| `UP`          | Move / navigate up               |
| `DOWN`        | Move / navigate down             |
| `LEFT`        | Move / navigate left             |
| `RIGHT`       | Move / navigate right            |
| `ACTION`      | Confirm / primary action (Enter) |
| `PREV_LIB`    | Switch to previous graphics lib  |
| `NEXT_LIB`    | Switch to next graphics lib      |
| `PREV_GAME`   | Switch to previous game          |
| `NEXT_GAME`   | Switch to next game              |
| `RESTART`     | Restart the current game         |
| `MENU`        | Return to main menu              |
| `EXIT`        | Exit the program                 |
| `SPACE`       | Space bar                        |
| `BACKSPACE`   | Backspace key                    |
| `KEY_A`–`KEY_Z` | Alphanumeric keys              |
| `KEY_0`–`KEY_9` | Digit keys                     |

### 3.2 `EntityType` — Visual Entity Categories

Used by the game library to describe what each cell on the map represents. The graphics library must render them appropriately.

| EntityType    | Description                              |
|---------------|------------------------------------------|
| `EMPTY`       | Empty/blank cell                         |
| `WALL`        | Impassable wall                          |
| `SNAKE_HEAD`  | Snake head                               |
| `SNAKE_BODY`  | Snake body segment                       |
| `FOOD`        | Food / collectible item                  |
| `HIDDEN`      | Hidden cell (Minesweeper)                |
| `REVEALED`    | Revealed cell (Minesweeper)              |
| `MINE`        | Mine (Minesweeper)                       |
| `FLAG`        | Flag marker (Minesweeper)                |
| `CURSOR`      | Player cursor / selection                |
| `NUMBER`      | A cell displaying a number               |
| `PLAYER`      | The player character                     |
| `ENEMY`       | An enemy entity                          |
| `BULLET`      | A projectile                             |
| `BONUS`       | A bonus / power-up item                  |

### 3.3 `Entity` — The Rendering Unit

The game communicates with the graphics layer exclusively through a `std::vector<Entity>`.

```cpp
struct Entity {
    int x;           // Column position (0-indexed, left = 0)
    int y;           // Row position    (0-indexed, top  = 0)
    EntityType type; // Visual category  (see table above)
    char symbol;     // Fallback ASCII character for terminal renderers
    int color;       // Color index (implementation-defined per library)
    std::string text;// Optional text label (e.g., for NUMBER cells)
};
```

> **Note for graphics libraries:** You are free to map `EntityType` to sprites, tiles, or colored blocks. Always use `symbol` as a fallback for text-mode renderers (NCurses).

---

## 4. Implementing a Graphics Library (`IDisplay`)

### 4.1 Interface Contract

Your library must contain a class that inherits from `IDisplay` (defined in `include/ILibrary/IDisplay.hpp`) and implements **every** pure virtual method.

```cpp
#include "ILibrary/IDisplay.hpp"

class MyDisplay : public IDisplay {
public:
    void init() override;
    void close() override;
    void clear() override;
    void display() override;
    void render(const std::vector<Entity>& entities) override;
    void renderHUD(const std::string& playerName, int score) override;
    void renderMenu(
        const std::vector<std::string>& games,
        const std::vector<std::string>& graphics,
        const std::string& playerName,
        int score
    ) override;
    void renderGameOver(int score) override;
    void renderSplash(const std::string& imagePath, const std::string& gameName) override;
    Event pollEvent() override;
    void playSound(const std::string& soundPath) override;
    std::string getName() const override;
};
```

### 4.2 Method Descriptions

| Method | Responsibility |
|--------|---------------|
| `init()` | Initialize the graphical context (window creation, `SDL_Init`, `initscr`, etc.). Called once after loading. |
| `close()` | Clean up all resources (close window, `endwin`, `SDL_Quit`, etc.). Called before unloading. |
| `clear()` | Clear the screen buffer. Called at the start of every frame. |
| `display()` | Flush / present the rendered frame. Called at the end of every frame. |
| `render(entities)` | Draw all game entities for the current frame. Entities are provided at map coordinates; you must scale them to screen pixels/characters. |
| `renderHUD(playerName, score)` | Draw the in-game overlay: player name, score, and keybinding hints. |
| `renderMenu(games, graphics, playerName, score)` | Draw the main menu. Lists must be shown with selection highlighting. The player name input field must also be rendered here. |
| `renderGameOver(score)` | Display a "Game Over" screen with the final score. |
| `renderSplash(imagePath, gameName)` | Display a 2-second splash screen when a game is loaded. Show the image (if able) or the game name as large ASCII art. |
| `pollEvent()` | Read a single input event and return the corresponding `Event` enum value. Returns `Event::UNKNOWN` if no input. Map all required keybindings (see §9). |
| `playSound(soundPath)` | Play the sound file at `soundPath`. You may implement this as a no-op if your library does not support audio. |
| `getName()` | Return a human-readable name: e.g., `"NCurses"`, `"SDL2"`, `"SFML"`. |

### 4.3 Mandatory Entry Points (`extern "C"`)

Your `.so` **must** export exactly these two C-linkage symbols. The core uses `dlsym` to locate them.

```cpp
extern "C" {
    IDisplay* createDisplay() {
        return new MyDisplay();
    }
    void destroyDisplay(IDisplay* display) {
        delete display;
    }
}
```

> **Warning:** Do **not** use `delete` inside `destroyDisplay` if you did not allocate with `new`. Match your allocation strategy.

### 4.4 Minimal Example — NCurses Skeleton

```cpp
#include "ILibrary/IDisplay.hpp"
#include <ncurses.h>

class NCursesDisplay : public IDisplay {
public:
    void init() override   { initscr(); cbreak(); noecho(); keypad(stdscr, TRUE); nodelay(stdscr, TRUE); }
    void close() override  { endwin(); }
    void clear() override  { ::clear(); }
    void display() override { refresh(); }

    Event pollEvent() override {
        int ch = getch();
        switch (ch) {
            case KEY_UP:    return Event::UP;
            case KEY_DOWN:  return Event::DOWN;
            case KEY_LEFT:  return Event::LEFT;
            case KEY_RIGHT: return Event::RIGHT;
            case '\n':      return Event::ACTION;
            case 'q':       return Event::EXIT;
            case 'r':       return Event::RESTART;
            case 'm':       return Event::MENU;
            case 'n':       return Event::NEXT_LIB;
            case 'b':       return Event::PREV_LIB;
            case 'x':       return Event::NEXT_GAME;
            case 'z':       return Event::PREV_GAME;
            default:        return Event::UNKNOWN;
        }
    }

    void render(const std::vector<Entity>& entities) override {
        for (const auto& e : entities)
            mvaddch(e.y, e.x, e.symbol);
    }

    void renderHUD(const std::string& name, int score) override {
        mvprintw(0, 0, "Player: %s | Score: %d", name.c_str(), score);
    }

    void renderMenu(const std::vector<std::string>& games,
                    const std::vector<std::string>& graphics,
                    const std::string& playerName, int score) override {
        mvprintw(1, 2, "=== ARCADE MENU ===");
        // ... render lists
    }

    void renderGameOver(int score) override {
        mvprintw(10, 10, "GAME OVER — Score: %d", score);
    }

    void renderSplash(const std::string&, const std::string& name) override {
        mvprintw(10, 10, "Loading: %s", name.c_str());
    }

    void playSound(const std::string&) override { /* NCurses has no audio */ }
    std::string getName() const override { return "NCurses"; }
};

extern "C" {
    IDisplay* createDisplay()              { return new NCursesDisplay(); }
    void destroyDisplay(IDisplay* display) { delete display; }
}
```

---

## 5. Implementing a Game Library (`IGame`)

### 5.1 Interface Contract

Your library must contain a class that inherits from `IGame` (defined in `include/ILibrary/IGame.hpp`) and implements every pure virtual method.

```cpp
#include "ILibrary/IGame.hpp"

class MyGame : public IGame {
public:
    void update() override;
    void handleEvent(Event event) override;
    void reset() override;
    std::vector<Entity> getEntities() const override;
    std::pair<int, int> getMapSize() const override;
    int getScore() const override;
    bool isGameOver() const override;
    std::vector<std::string> getSounds() override;
    std::string getName() const override;
};
```

### 5.2 Method Descriptions

| Method | Responsibility |
|--------|---------------|
| `update()` | Advance the game simulation by one tick. Handle movement, collisions, timers, AI, etc. |
| `handleEvent(event)` | React to a player input event. Update direction, place flags, fire bullets, etc. |
| `reset()` | Restore the game to its initial state. Called on game start and restart. |
| `getEntities()` | Return the complete list of `Entity` objects to be drawn this frame. Coordinates are in **map cells**, not pixels. |
| `getMapSize()` | Return `{width, height}` in cells. The graphics library uses this to scale rendering. |
| `getScore()` | Return the current player score. |
| `isGameOver()` | Return `true` when the game has ended (win or loss). |
| `getSounds()` | Return a list of sound file paths to play this frame. Return an empty vector if no sounds. |
| `getName()` | Return a human-readable name: e.g., `"Snake"`, `"Minesweeper"`. |

### 5.3 Mandatory Entry Points (`extern "C"`)

```cpp
extern "C" {
    IGame* createGame() {
        return new MyGame();
    }
    void destroyGame(IGame* game) {
        delete game;
    }
}
```

### 5.4 Game Loop Integration

The core calls your game methods in the following order each frame:

```
Core::handleGameLogic(event)
    │
    ├── _game->handleEvent(event)   ← Process player input
    ├── _game->update()             ← Advance simulation
    ├── _game->getSounds()          ← Collect sounds to play
    ├── _game->isGameOver()         ← Check end condition
    ├── _game->getEntities()        ← Collect render list
    └── _game->getScore()           ← Get current score
```

### 5.5 Minimal Example — Snake Skeleton

```cpp
#include "ILibrary/IGame.hpp"
#include <deque>
#include <cstdlib>

class SnakeGame : public IGame {
    struct Pos { int x, y; };
    std::deque<Pos> _snake;
    Pos _food;
    int _dx = 1, _dy = 0;
    int _score = 0;
    bool _gameOver = false;
    static constexpr int W = 20, H = 20;

public:
    void reset() override {
        _snake.clear();
        _snake.push_back({10, 10});
        _snake.push_back({9,  10});
        _snake.push_back({8,  10});
        _snake.push_back({7,  10});
        _dx = 1; _dy = 0; _score = 0; _gameOver = false;
        spawnFood();
    }

    void handleEvent(Event e) override {
        if (e == Event::UP    && _dy == 0) { _dx = 0; _dy = -1; }
        if (e == Event::DOWN  && _dy == 0) { _dx = 0; _dy =  1; }
        if (e == Event::LEFT  && _dx == 0) { _dx = -1; _dy = 0; }
        if (e == Event::RIGHT && _dx == 0) { _dx =  1; _dy = 0; }
    }

    void update() override {
        Pos newHead = { _snake.front().x + _dx, _snake.front().y + _dy };
        if (newHead.x < 0 || newHead.x >= W || newHead.y < 0 || newHead.y >= H) {
            _gameOver = true; return;
        }
        // self-collision check omitted for brevity
        _snake.push_front(newHead);
        if (newHead.x == _food.x && newHead.y == _food.y) {
            _score += 10; spawnFood();
        } else {
            _snake.pop_back();
        }
    }

    std::vector<Entity> getEntities() const override {
        std::vector<Entity> out;
        out.push_back({ _food.x, _food.y, EntityType::FOOD, '*', 2, "" });
        for (size_t i = 0; i < _snake.size(); ++i) {
            EntityType t = (i == 0) ? EntityType::SNAKE_HEAD : EntityType::SNAKE_BODY;
            char sym = (i == 0) ? '@' : 'o';
            out.push_back({ _snake[i].x, _snake[i].y, t, sym, 1, "" });
        }
        return out;
    }

    std::pair<int, int> getMapSize() const override { return {W, H}; }
    int getScore() const override { return _score; }
    bool isGameOver() const override { return _gameOver; }
    std::vector<std::string> getSounds() override { return {}; }
    std::string getName() const override { return "Snake"; }

private:
    void spawnFood() { _food = { rand() % W, rand() % H }; }
};

extern "C" {
    IGame* createGame()          { return new SnakeGame(); }
    void destroyGame(IGame* g)   { delete g; }
}
```

---

## 6. Dynamic Loading Contract

The `DLLoader<T>` template class (in `include/Core/DLLoader.hpp`) wraps `dlopen`/`dlsym`/`dlclose`. The core uses it as follows to load a display:

```cpp
// Load
DLLoader<IDisplay> loader("./lib/arcade_mylib.so");
IDisplay* display = loader.getInstance("createDisplay");

// Destroy
loader.destroyInstance(display, "destroyDisplay");
```

The library scanning logic (in `Core::scanLibFolder`) opens every `.so` in `./lib/` and checks for the `createDisplay` or `createGame` symbol to categorize each plugin. **A library that exports both symbols is undefined behavior.**

```
./lib/*.so
    ├── has symbol "createDisplay" → classified as Graphics library
    ├── has symbol "createGame"    → classified as Game library
    └── neither                   → ignored
```

**Critical constraints:**

1. Your `.so` must be compiled as a **position-independent shared library** (`-fPIC -shared`).
2. Your `.so` must **not** link against `libdl` or the arcade core itself.
3. All your dependencies (e.g., `libSDL2`, `libsfml-graphics`) must be linked in your `.so`, not in the core.
4. You should export symbols with `extern "C"` to prevent C++ name mangling.

---

## 7. Building Your Plugin

### 7.1 Manual Compilation

**Graphics library:**
```bash
g++ -std=c++17 -fPIC -shared -Wall -Wextra \
    -Iinclude \
    src/Displays/MyLib.cpp \
    -o lib/arcade_mylib.so \
    -lmy_dependency
```

**Game library:**
```bash
g++ -std=c++17 -fPIC -shared -Wall -Wextra \
    -Iinclude \
    src/Games/MyGame.cpp \
    -o lib/arcade_mygame.so
```

> Note: game libraries typically have **no external runtime dependencies**.

The Makefile is configured to output all `.so` files into the `./lib/` directory automatically.

### 7.3 Verify Linkage

After building, verify that your core is still independent:
```bash
ldd ./arcade | grep arcade_   # Should return nothing
ldd ./lib/arcade_mylib.so     # Should list only system/third-party libs
```

---

## 8. Integration Checklist

Use this checklist before submitting or sharing your library:

### Graphics Library
- [ ] Class inherits from `IDisplay` (from `include/ILibrary/IDisplay.hpp`)
- [ ] All 11 pure virtual methods implemented
- [ ] `extern "C"` `createDisplay()` and `destroyDisplay()` exported
- [ ] `pollEvent()` maps all required keybindings (see §9)
- [ ] `.so` placed in `./lib/`
- [ ] `.so` file name matches pattern `arcade_<name>.so`
- [ ] `ldd ./arcade` does NOT list your library
- [ ] `getName()` returns a non-empty string

### Game Library
- [ ] Class inherits from `IGame` (from `include/ILibrary/IGame.hpp`)
- [ ] All 9 pure virtual methods implemented
- [ ] `extern "C"` `createGame()` and `destroyGame()` exported
- [ ] `reset()` fully reinitializes game state (called on first load)
- [ ] `getEntities()` uses only types defined in `EntityType`
- [ ] `getMapSize()` returns consistent dimensions across calls
- [ ] `.so` placed in `./lib/`
- [ ] `.so` file name matches pattern `arcade_<name>.so`
- [ ] No rendering code inside the game library
- [ ] No SDL/NCurses/SFML headers included in the game library

---

## 9. Key Bindings Reference

These are the **mandatory** bindings that every graphics library's `pollEvent()` must support:

| Action                  | Suggested Key (adapt to library) | `Event` returned   |
|-------------------------|----------------------------------|--------------------|
| Navigate Up             | Arrow Up / `W`                   | `Event::UP`        |
| Navigate Down           | Arrow Down / `S`                 | `Event::DOWN`      |
| Navigate Left           | Arrow Left / `A`                 | `Event::LEFT`      |
| Navigate Right          | Arrow Right / `D`                | `Event::RIGHT`     |
| Confirm / Action        | Enter / Space                    | `Event::ACTION`    |
| Previous Graphics Lib   | `F1` / `B`                       | `Event::PREV_LIB`  |
| Next Graphics Lib       | `F2` / `N`                       | `Event::NEXT_LIB`  |
| Previous Game           | `F3` / `Z`                       | `Event::PREV_GAME` |
| Next Game               | `F4` / `X`                       | `Event::NEXT_GAME` |
| Restart Game            | `R`                              | `Event::RESTART`   |
| Go to Menu              | `M` / `Escape`                   | `Event::MENU`      |
| Exit Program            | `Q`                              | `Event::EXIT`      |
| Space Bar               | Space                            | `Event::SPACE`     |
| Backspace               | Backspace                        | `Event::BACKSPACE` |
| Letters A–Z             | Corresponding keys               | `Event::KEY_A`–`Z` |
| Digits 0–9              | Corresponding keys               | `Event::KEY_0`–`9` |

> Games may also listen for `Event::SPACE`, letter/digit keys for in-game mechanics (speed boost, flag placement, etc.).

---

*For questions about interface compatibility, contact the project team. The interface version documented here corresponds to `Common.hpp` / `IDisplay.hpp` / `IGame.hpp` as of April 2026.*
