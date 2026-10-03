#include "../../include/network/Server.hpp"
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>
#include <algorithm>
#include <iostream>

Server::~Server() { stop(); }

bool Server::init(int port)
{
    _serverFd = socket(AF_INET, SOCK_STREAM, 0);
    if (_serverFd < 0)
        return false;

    int opt = 1;
    setsockopt(_serverFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr;
    std::memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(port);

    if (bind(_serverFd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        std::cerr << "Failed to bind on port " << port << std::endl;
        return false;
    }
    if (listen(_serverFd, 10) < 0) {
        std::cerr << "Failed to listen on socket" << std::endl;
        return false;
    }

    _running = true;
    return true;
}

void Server::run(int timeoutMs)
{
    if (!_running)
        return;

    rebuildPollFds();

    int ret = poll(_pollFds.data(), _pollFds.size(), timeoutMs);
    if (ret < 0)
        return;

    for (size_t i = 0; i < _pollFds.size(); i++) {
        if (_pollFds[i].revents == 0)
            continue;

        if (_pollFds[i].fd == _serverFd) {
            acceptNewClient();
            break;
        }

        if (_pollFds[i].revents & (POLLIN | POLLHUP | POLLERR | POLLNVAL))
            handleClientData(i);
    }
}

void Server::stop()
{
    _running = false;
    for (auto &client : _clients)
        client->disconnect();
    _clients.clear();
    if (_serverFd >= 0) {
        close(_serverFd);
        _serverFd = -1;
    }
}

Client *Server::getClient(int fd)
{
    for (auto &client : _clients) {
        if (client->getFd() == fd || client->getOrigFd() == fd)
            return client.get();
    }
    return nullptr;
}

void Server::disconnectClient(int fd)
{
    for (auto &client : _clients) {
        if (client->getFd() == fd) {
            if (_onDisconnect)
                _onDisconnect(*client);
            removeClient(client.get());
            return;
        }
    }
}

void Server::removeClient(Client *client)
{
    for (auto it = _clients.begin(); it != _clients.end(); ++it) {
        if (it->get() == client) {
            _clients.erase(it);
            rebuildPollFds();
            return;
        }
    }
}

void Server::rebuildPollFds()
{
    _pollFds.clear();
    _pollFds.push_back({_serverFd, POLLIN, 0});
    for (auto &client : _clients) {
        _pollFds.push_back({client->getFd(), POLLIN, 0});
    }
}

void Server::acceptNewClient()
{
    struct sockaddr_in addr;
    socklen_t addrLen = sizeof(addr);
    int clientFd = accept(_serverFd, (struct sockaddr *)&addr, &addrLen);
    if (clientFd < 0)
        return;

    auto client = std::make_unique<Client>(clientFd);
    if (_onConnect)
        _onConnect(*client);
    _clients.push_back(std::move(client));
    rebuildPollFds();
}

void Server::handleClientData(size_t index)
{
    Client *client = getClient(_pollFds[index].fd);
    if (!client)
        return;

    if (_pollFds[index].revents & POLLNVAL) {
        if (_onDisconnect)
            _onDisconnect(*client);
        removeClient(client);
        return;
    }

    client->onReadable();
    if (client->getFd() < 0) {
        if (_onDisconnect)
            _onDisconnect(*client);
        removeClient(client);
        return;
    }
    if (_onData)
        _onData(*client);
    if (client->getFd() < 0) {
        if (_onDisconnect)
            _onDisconnect(*client);
        removeClient(client);
    }
}
