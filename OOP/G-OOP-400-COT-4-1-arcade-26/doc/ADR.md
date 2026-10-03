# Architecture Decision Records (ADR) — Arcade

This document records the significant technical decisions made during the development of the Arcade platform, including context, decision, and consequences.

---

## ADR 01: Dynamic Loading using `dlopen`/`dlsym`

### Status
Accepted

### Context
The project requires a gaming platform where graphics libraries and games are loaded at runtime as shared libraries (`.so`). The core program must not have any compile-time dependency on these libraries.

### Decision
We use the POSIX `libdl` library (`dlopen`, `dlsym`, `dlclose`) encapsulated within a generic `DLLoader<T>` template class. 

- **Encapsulation**: The `DLLoader` class handles RAII (Resource Acquisition Is Initialization), ensuring that `dlclose` is called in the destructor.
- **Genericism**: The template allows loading any class type as long as a factory function is provided.
- **Probing**: The core scans the `./lib/` directory and uses `dlsym` to check for specific entry points (`createDisplay` or `createGame`) to identify library types.

### Consequences
- **Pros**: Clear separation of concerns; the core is highly extensible. New games or renderers can be added without recompiling the core.
- **Cons**: Requires careful memory management (matching `new` in the library with `delete` via a exported destructor function). `extern "C"` is required to avoid name mangling.

---

## ADR 02: Interface-Based Architecture (IDisplay & IGame)

### Status
Accepted

### Context
To ensure that different groups can share libraries, a strict contract must be established between the Core and the dynamic modules.

### Decision
We defined two primary abstract interfaces:
- `IDisplay`: Handles window lifecycle, event polling, and rendering of entities/UI.
- `IGame`: Handles game state, logic updates, and event processing.

Communication between the two is mediated by the Core using a shared data model:
- `Entity`: A lightweight struct representing an object on a 2D grid.
- `Event`: An enum representing generic input events.

### Consequences
- **Pros**: Complete decoupling of graphics and game logic. A game can run on any display without modification.
- **Cons**: Limited to grid-based or sprite-based 2D games as defined by the `Entity` struct. Text-based information must be passed via the `text` field or `renderHUD`.

---

## ADR 03: Bridge Pattern for Runtime Library Switching

### Status
Accepted

### Context
The platform must support switching the graphics library or the current game while the program is running, without exiting.

### Decision
The Core act as a "Bridge". It holds pointers to the current `IDisplay` and `IGame` instances. When a switch is requested:
1. The current instance is destroyed via its specific `destroy` symbol.
2. The library handle is closed.
3. The new library is loaded and instantiated.
4. The state (player name, current game progress if possible) is transferred or managed by the Core.

### Consequences
- **Pros**: Seamless user experience. High flexibility.
- **Cons**: Increased complexity in the Core's state machine. Potential for resource leaks if libraries are not perfectly isolated.

---

## ADR 04: Fixed 60 FPS Logic Loop

### Status
Accepted

### Context
Consistent game speed across different hardware and different graphics libraries (Ncurses vs. SDL2).

### Decision
The Core implements a fixed-time-step loop using `std::chrono`. It calculates the time taken to process a frame and sleeps the remaining time to maintain exactly 60 iterations per second.

### Consequences
- **Pros**: Stable game physics and movement speed.
- **Cons**: If rendering takes longer than 16.6ms, the loop will lag. Input polling is tied to the frame rate (poll once per frame).
