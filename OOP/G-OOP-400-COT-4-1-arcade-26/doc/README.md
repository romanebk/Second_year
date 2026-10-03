# Arcade Documentation

This directory contains the full documentation suite for the Arcade platform, following professional standards and architecture requirements.

---

## Document Index

| Document | Purpose |
|----------|---------|
| [**PLUGIN_GUIDE.md**](./PLUGIN_GUIDE.md) | **Developer Handover**: Technical guide on how to implement new games and graphics libraries. |
| [**CLASS_DIAGRAM.md**](./CLASS_DIAGRAM.md) | **Architecture**: UML Class diagrams and sequence diagrams explaining the system's runtime flows. |
| [**ADR.md**](./ADR.md) | **Decision Logging**: Architecture Decision Records documenting why specific patterns and tools were chosen. |
| [**RUNBOOK.md**](./RUNBOOK.md) | **Operations**: Operational guide for building, running, and troubleshooting the platform. |

---

## System Overview

The Arcade platform is designed for **extensibility** and **modular separation**.

### Core Concepts
1.  **Shared Interface**: All modules communicate via fixed APIs defined in `include/ILibrary/`.
2.  **Shared Model**: A grid-based `Entity` system allows any game to render on any display.
3.  **Run-time Discovery**: The launcher automatically detects new `.so` files in the `lib/` directory.

### Quick Links
- [Project Changelog](../CHANGELOG.md)
- [Root README](../README.md)

---

## Build System

### Autonomous Makefile
The project uses a completely autonomous Makefile (no CMake dependency):
- **Automatic dependency detection**: Checks for NCurses, SDL2, SFML
- **Graceful degradation**: Compiles only available libraries
- **Standard Epitech targets**: `make re`, `make fclean`, `make core`, `make games`, `make graphicals`

### Key Features
- **100% CMake-free**: Pure Makefile implementation
- **Robust dependency handling**: Silent fallback for missing libraries
- **Fast compilation**: No CMake generation overhead

---

## Implemented Modules

### Graphics Renderers
- **NCurses**: Terminal-based, minimal dependencies.
- **SDL2**: Sprite-based, supports higher resolution and textures.
- **SFML**: Hardware accelerated, modern rendering features.

### Games
- **Snake**: Classic survival with cyclic mode and obstacles.
- **Nibbler**: Maze navigation.
- **Minesweeper**: Logic-based grid clearing with mine detection.

---

