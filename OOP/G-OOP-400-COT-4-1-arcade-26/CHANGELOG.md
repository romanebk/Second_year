# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-04-12

### Added
- **Core Platform**: Integrated launcher with dynamic `DLLoader`.
- **Graphics Libraries**:
    - `arcade_ncurses.so`: Terminal-based rendering.
    - `arcade_sdl2.so`: Pixel-based rendering with fonts and images.
    - `arcade_sfml.so`: Modern hardware-accelerated rendering.
- **Games**:
    - `arcade_snake.so`: Classic greedy gameplay.
    - `arcade_nibbler.so`: Maze-based snake variant.
    - `arcade_minesweeper.so`: Logic-based puzzle game.
- **Features**:
    - Runtime library switching (Graphics and Games).
    - 2-second splash screen on game load.
    - Score tracking and display.
    - Player name input.
- **Documentation**:
    - Full plugin developer guide.
    - Class diagram and architecture manual.
    - Architecture Decision Records (ADRs).
    - Operational Runbook.
    - Detailed README and documentation index.

### Changed
- Standardized error handling to use exit code 84 and descriptive stderr messages.

### Fixed
- Stabilized SFML/SDL2 context switching during runtime library swaps.
