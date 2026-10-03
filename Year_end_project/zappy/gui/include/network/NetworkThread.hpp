#pragma once
#include <string>
#include <atomic>
#include "core/SharedState.hpp"
#include "network/Network.hpp"
#include "network/Buffer.hpp"
#include "network/CommandQueue.hpp"
#include "parser/Parser.hpp"
#include "state/GameState.hpp"

class NetworkThread {
public:
    NetworkThread(const std::string &host, int port, SharedState &shared);
    void run();
    void stop();
    CommandQueue &getQueue() { return _cmdQueue; }

private:
    void handshake();

    SharedState      &_shared;
    Network           _network;
    Buffer            _buffer;
    CommandQueue      _cmdQueue;
    GameState         _localState;
    Parser            _parser;
    std::atomic<bool> _running;
};