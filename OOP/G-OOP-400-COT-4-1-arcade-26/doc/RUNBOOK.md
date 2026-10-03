# Runbook — Arcade Platform Operations

This guide provides operational instructions for running the Arcade platform and troubleshooting common issues.

---

## 0. Repository Setup

### Cloning the Repository
First, clone the repository to get the source code:

```bash
git clone git@github.com:EpitechPGE2-2025/G-OOP-400-COT-4-1-arcade-26.git
cd G-OOP-400-COT-4-1-arcade-26
```

This will create a local copy of the project with all necessary files including:
- Source code in `src/` directory
- Headers in `include/` directory  
- Build configuration files
- Documentation in `doc/` directory

After cloning, proceed with the installation steps below.

---

## 1. Installation & Environment Setups

### Dependencies
Ensure the following libraries are installed on your system:
- **Build**: `g++`, `make`
- **Graphics**: `libncurses5-dev`, `libsdl2-dev`, `libsdl2-ttf-dev`, `libsdl2-image-dev`, `libsfml-dev`

### System Requirements
- Linux OS (Ubuntu/Debian recommended)
- Support for shared dynamic libraries (`libdl`)

---

## 2. Compilation

### Using Makefile
To build everything (core + libraries):
```bash
make re
```

To build components separately:
```bash
make core       # Only the launcher
make games      # Only the games (.so)
make graphicals # Only the renderers (.so)
```

### Clean and Rebuild
```bash
make re         # Clean and rebuild everything
make fclean     # Remove all binaries and libraries
```


---

## 3. Launching the Program

The program requires exactly one argument: the path to the initial graphics library.

```bash
./arcade ./lib/arcade_ncurses.so
```

**Common Exit Codes:**
- `0`: Success.
- `84`: Error (invalid arguments, missing library, runtime crash).

---

## 4. Usage & Controls

### Main Menu
- **Arrows Up/Down**: Select a Game.
- **Arrows Left/Right**: Cycle through Graphics Libraries immediately.
- **Typing**: Enter your player name (max 15 chars).
- **Enter**: Start the selected game.
- **ESC**: Exit.

### In-Game Controls
- **Arrows**: Movement / Directional control.
- **8**: Restart current game.
- **9 / ESC**: Return to Menu.
- **2 / 3**: Cycle to Previous/Next Graphics Library.
- **4 / 5**: Cycle to Previous/Next Game.
- **ESC**: Exit to desktop.

---

## 5. Troubleshooting (FAQ)

### "Error: Failed to load display library"
- **Cause**: The path provided is incorrect or the `.so` file is missing.
- **Fix**: Check that the file exists in `./lib/` and that the name is exactly correct.

### "Error: There is not a folder named lib"
- **Cause**: The `./lib/` directory is missing from the root of the repository.
- **Fix**: Create the directory (`mkdir lib`) and rebuild the libraries.

### SFML/SDL2 rendering issues in Terminal
- **Cause**: Some terminals do not handle graphical windows spawned from CLI gracefully if environment variables are missing.
- **Fix**: Ensure your `DISPLAY` environment variable is set correctly if running on a remote server or WSL.

### Segfault on Library Switch
- **Cause**: Incompatible binary interface (ABI) or static members holding state between loads.
- **Fix**: Perform a clean rebuild: `make re`.

---

## 6. Development Operations

### Adding a new library
1. Implement the required interface (`IDisplay` or `IGame`).
2. Add the factory functions (`extern "C"`).
3. Compile as a shared library and place it in `./lib/`.
4. The core will detect it automatically on the next launch.

### Dependency Detection
The Makefile automatically detects available libraries:
- **NCurses**: Checked via `/usr/include/ncurses.h`
- **SDL2**: Checked via `/usr/include/SDL2` directory
- **SFML**: Checked via `/usr/include/SFML` directory

Only available libraries will be compiled. Missing dependencies are silently skipped.

### Cleanup
To remove all binaries and `.so` files:
```bash
make fclean
```
