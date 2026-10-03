#include "NetworkThread.hpp"
#include <iostream>
#include <unistd.h>
#include <chrono>
#include <algorithm>
#include <poll.h>

NetworkThread::NetworkThread(const std::string &host, int port, SharedState &shared)
    : _shared(shared),
      _network(host, port),
      _parser(_localState),
      _running(true)
{}

void NetworkThread::handshake() {
    std::string welcome;
    while (welcome.find('\n') == std::string::npos) {
        std::string data = _network.receive();
        if (!data.empty()) welcome += data;
    }
    if (welcome.find("WELCOME") == std::string::npos) {
        std::cerr << "[network] handshake échoué\n";
        _running = false;
        return;
    }
    _network.send("GRAPHIC\n");
    std::cout << "[network] connecté\n";
}

void NetworkThread::run() {
    if (!_network.connect()) {
        std::cerr << "[network] connexion échouée\n";
        _running = false;
        return;
    }
    handshake();

    using clock = std::chrono::steady_clock;
    auto lastInvPoll  = clock::now();   
    auto lastTilePoll = clock::now();   

    while (_running) {
        
        
        struct pollfd pfd{_network.getFd(), POLLIN, 0};
        poll(&pfd, 1, 16);

        std::string data = _network.receive();
        if (!data.empty()) {
            _buffer.append(data);
            while (_buffer.hasLine())
                _parser.parse(_buffer.getLine());
            _shared.write(_localState);
        }
        if (_network.serverClosed()) {
            std::cerr << "[network] connexion fermée par le serveur\n";
            _localState.serverConnected = false;
            _shared.write(_localState);
            _running = false;
            break;
        }

        
        
        
        
        
        auto now = clock::now();
        using ms = std::chrono::milliseconds;
        long invInterval = std::max<long>(500,
            static_cast<long>(_localState.players.size()) * 20);

        if (std::chrono::duration_cast<ms>(now - lastInvPoll).count() >= invInterval) {
            std::string req;
            for (const auto &kv : _localState.players) {
                const std::string id = std::to_string(kv.first); 
                req += "pin " + id + "\n";
                req += "plv " + id + "\n";
            }
            if (!req.empty())
                _network.send(req);
            lastInvPoll = now;
        }

        if (std::chrono::duration_cast<ms>(now - lastTilePoll).count() >= 2000) {
            _network.send("mct\n"); 
            lastTilePoll = now;
        }

        std::string cmd;
        while (_cmdQueue.pop(cmd))
            _network.send(cmd);
    }
}

void NetworkThread::stop() {
    _running = false;
}