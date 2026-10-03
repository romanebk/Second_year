#include "parser/Parser.hpp"
#include "parser/CommandHandlers.hpp"
#include "parser/Protocol.hpp"
#include <iostream>

Parser::Parser(GameState &state) : _state(state) {
    registerHandlers();
}

void Parser::registerHandlers() {
    _handlers[Protocol::MSZ] = CommandHandlers::handleMsz;
    _handlers[Protocol::SGT] = CommandHandlers::handleSgt;
    _handlers[Protocol::TNA] = CommandHandlers::handleTna;
    _handlers[Protocol::BCT] = CommandHandlers::handleBct;
    _handlers[Protocol::PNW] = CommandHandlers::handlePnw;
    _handlers[Protocol::PPO] = CommandHandlers::handlePpo;
    _handlers[Protocol::PLV] = CommandHandlers::handlePlv;
    _handlers[Protocol::PIN] = CommandHandlers::handlePin;
    _handlers[Protocol::PDI] = CommandHandlers::handlePdi;
    _handlers[Protocol::PIC] = CommandHandlers::handlePic;
    _handlers[Protocol::PIE] = CommandHandlers::handlePie;
    _handlers[Protocol::SEG] = CommandHandlers::handleSeg;
    _handlers[Protocol::PEX] = CommandHandlers::handlePex;
    _handlers[Protocol::PBC] = CommandHandlers::handlePbc;
    _handlers[Protocol::PFK] = CommandHandlers::handlePfk;
    _handlers[Protocol::PDR] = CommandHandlers::handlePdr;
    _handlers[Protocol::PGT] = CommandHandlers::handlePgt;
    _handlers[Protocol::ENW] = CommandHandlers::handleEnw;
    _handlers[Protocol::EBO] = CommandHandlers::handleEbo;
    _handlers[Protocol::EDI] = CommandHandlers::handleEdi;
    _handlers[Protocol::SST] = CommandHandlers::handleSst;
    _handlers[Protocol::SMG] = CommandHandlers::handleSmg;
}

void Parser::parse(const std::string &line) {
    if (line.empty()) return;
    std::istringstream ss(line);
    std::string cmd;
    ss >> cmd;

    auto it = _handlers.find(cmd);
    if (it != _handlers.end())
        it->second(ss, _state);
    else
        std::cout << "[unknown] " << line << "\n";
}