/*
** EPITECH PROJECT, 2026
** Server.cpp
** File description:
** Network server implementation
*/#include "../../include/network/Server.hpp"
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>
#include <algorithm>
#include <iostream>
#include <cerrno>
#include <cstdio>
#include <fcntl.h>

Server::~Server() { stop(); }

bool Server::init(int port)
{
    _serverFd = socket(AF_INET, SOCK_STREAM, 0);
    if (_serverFd < 0)
        return false;

    if (fcntl(_serverFd, F_SETFL, O_NONBLOCK) < 0) {
        std::cerr << "fcntl nonblock failed: " << strerror(errno) << std::endl;
        close(_serverFd);
        _serverFd = -1;
        return false;
    }

    int opt = 1;
    if (setsockopt(_serverFd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        std::cerr << "setsockopt failed: " << strerror(errno) << std::endl;
        close(_serverFd);
        _serverFd = -1;
        return false;
    }

    struct sockaddr_in addr;
    std::memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(port);

    if (bind(_serverFd, (struct sockaddr *)&addr, sizeof(addr)) < 0) {
        std::cerr << "bind failed on port " << port << ": " << strerror(errno) << std::endl;
        close(_serverFd);
        _serverFd = -1;
        return false;
    }
    if (listen(_serverFd, 10) < 0) {
        std::cerr << "listen failed: " << strerror(errno) << std::endl;
        close(_serverFd);
        _serverFd = -1;
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
    if (ret < 0) {
        if (errno == EINTR)
            return;
        std::cerr << "poll error: " << strerror(errno) << std::endl;
        return;
    }

    for (size_t i = 0; i < _pollFds.size(); i++) {
        if (_pollFds[i].revents == 0)
            continue;

        if (_pollFds[i].fd == STDIN_FILENO && (_pollFds[i].revents & POLLIN)) {
            char c;
            ssize_t n = read(STDIN_FILENO, &c, 1);
            if (n <= 0) {
                if (n < 0)
                    std::cerr << "read(stdin) failed: " << strerror(errno) << std::endl;
                if (_onStdinEOF)
                    _onStdinEOF();
                return;
            }
            continue;
        }

        if (_pollFds[i].fd == _serverFd) {
            acceptNewClient();
            continue;
        }

        if (_pollFds[i].revents & POLLOUT) {
            handleClientWrite(i);
            continue;
        }
        if (_pollFds[i].revents & (POLLIN | POLLHUP | POLLERR | POLLNVAL))
            handleClientData(i);
    }

    cleanupZombieClients();
}

void Server::cleanupZombieClients()
{
    auto it = _clients.begin();
    while (it != _clients.end()) {
        if ((*it)->getFd() < 0) {
            if (_onDisconnect)
                _onDisconnect(**it);
            it = _clients.erase(it);
        } else {
            ++it;
        }
    }
}

void Server::stop()
{
    _running = false;
    for (auto &client : _clients) {
        if (_onDisconnect)
            _onDisconnect(*client);
        client->disconnect();
    }
    _clients.clear();
    if (_serverFd >= 0) {
        if (close(_serverFd) < 0)
            std::cerr << "close(server_fd) failed: " << strerror(errno) << std::endl;
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
    if (isatty(STDIN_FILENO))
        _pollFds.push_back({STDIN_FILENO, POLLIN, 0});
    _pollFds.push_back({_serverFd, POLLIN, 0});
    for (auto &client : _clients) {
        short events = POLLIN;
        if (client->hasPendingData())
            events |= POLLOUT;
        _pollFds.push_back({client->getFd(), events, 0});
    }
}

void Server::acceptNewClient()
{
    struct sockaddr_in addr;
    socklen_t addrLen = sizeof(addr);
    int clientFd = accept(_serverFd, (struct sockaddr *)&addr, &addrLen);
    if (clientFd < 0) {
        if (errno != EAGAIN && errno != EWOULDBLOCK)
            std::cerr << "accept failed: " << strerror(errno) << std::endl;
        return;
    }

    if (fcntl(clientFd, F_SETFL, O_NONBLOCK) < 0) {
        std::cerr << "fcntl nonblock failed: " << strerror(errno) << std::endl;
        close(clientFd);
        return;
    }

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
        client->disconnect();
        return;
    }

    client->onReadable();
    if (client->getFd() < 0)
        return;
    if (_onData)
        _onData(*client);
    if (client->getFd() < 0)
        return;
}

void Server::handleClientWrite(size_t index)
{
    Client *client = getClient(_pollFds[index].fd);
    if (!client)
        return;

    client->sendData();
    if (client->getFd() < 0)
        return;
}
