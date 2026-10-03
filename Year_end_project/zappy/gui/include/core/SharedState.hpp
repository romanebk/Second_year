#pragma once
#include <mutex>
#include "state/GameState.hpp"

class SharedState {
public:
    void write(const GameState &state) {
        std::lock_guard<std::mutex> lock(_mutex);
        _state = state;
    }

    GameState read() {
        std::lock_guard<std::mutex> lock(_mutex);
        return _state;
    }

private:
    GameState  _state;
    std::mutex _mutex;
};