#include "network/NetworkThread.hpp"
#include <iostream>
#include <unistd.h>

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

    while (_running) {
        std::string data = _network.receive();
        if (!data.empty()) {
            _buffer.append(data);
            while (_buffer.hasLine())
                _parser.parse(_buffer.getLine());
            _shared.write(_localState);
        }
        while (!_cmdQueue.empty())
            _network.send(_cmdQueue.pop());
        usleep(1000);
    }
}

void NetworkThread::stop() {
    _running = false;
}