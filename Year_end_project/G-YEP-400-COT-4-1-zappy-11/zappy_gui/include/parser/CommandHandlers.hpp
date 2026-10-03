#pragma once
#include <sstream>
#include "../state/GameState.hpp"

namespace CommandHandlers {
    void handleMsz(std::istringstream &ss, GameState &state);
    void handleSgt(std::istringstream &ss, GameState &state);
    void handleTna(std::istringstream &ss, GameState &state);
    void handleBct(std::istringstream &ss, GameState &state);
    void handlePnw(std::istringstream &ss, GameState &state);
    void handlePpo(std::istringstream &ss, GameState &state);
    void handlePlv(std::istringstream &ss, GameState &state);
    void handlePin(std::istringstream &ss, GameState &state);
    void handlePdi(std::istringstream &ss, GameState &state);
    void handlePic(std::istringstream &ss, GameState &state);
    void handlePie(std::istringstream &ss, GameState &state);
    void handleSeg(std::istringstream &ss, GameState &state);
    void handlePex(std::istringstream &ss, GameState &state);
    void handlePbc(std::istringstream &ss, GameState &state);
    void handlePfk(std::istringstream &ss, GameState &state);
    void handlePdr(std::istringstream &ss, GameState &state);
    void handlePgt(std::istringstream &ss, GameState &state);
    void handleEnw(std::istringstream &ss, GameState &state);
    void handleEbo(std::istringstream &ss, GameState &state);
    void handleEdi(std::istringstream &ss, GameState &state);
    void handleSst(std::istringstream &ss, GameState &state);
    void handleSmg(std::istringstream &ss, GameState &state);
}