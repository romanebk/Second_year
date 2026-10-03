#ifndef PARSER_HPP
#define PARSER_HPP

#include "Protocol.hpp"
#include "CommandHandlers.hpp"
#include "../state/GameState.hpp"
#include <string>
#include <functional>
class Parser {
public:
    Parser(GameState &state);
    void parse(const std::string &line);

private:
    using Handler = std::function<void(std::istringstream&, GameState&)>;
    void registerHandlers();

    GameState                      &_state;
    std::map<std::string, Handler>  _handlers;
};

#endif