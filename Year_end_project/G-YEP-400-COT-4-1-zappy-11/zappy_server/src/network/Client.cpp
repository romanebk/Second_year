#include "../../include/network/Client.hpp"
#include <unistd.h>
#include <sys/socket.h>
#include <iostream>
#include <cerrno>
#include <cstring>

Client::Client(int fd)
    : _fd(fd), _origFd(fd), _state(ClientState::AWAITING_TEAM),
      _inBuffer(0), _outBuffer(0),
      _playerId(-1) {}

Client::~Client() { disconnect(); }

void Client::onReadable()
{
    ssize_t n = _inBuffer.readFromFd(_fd);
    if (n < 0) {
        if (errno == EAGAIN || errno == EWOULDBLOCK)
            return;
        std::cerr << "read(" << _fd << ") failed: " << strerror(errno) << std::endl;
        disconnect();
        return;
    }
    if (n == 0) {
        disconnect();
        return;
    }
    if (_inBuffer.isFull()) {
        disconnect();
        return;
    }
}

void Client::onWritable()
{
    if (_outBuffer.hasData())
        sendData();
}

bool Client::hasLine() const
{
    return _inBuffer.hasLine();
}

std::string Client::popLine()
{
    return _inBuffer.popLine();
}

void Client::pushLine(const std::string &line)
{
    if (_fd < 0 || _state == ClientState::DEAD)
        return;
    if (!_outBuffer.push(line)) {
        disconnect();
        return;
    }
    sendData();
}

bool Client::sendData()
{
    if (!_outBuffer.hasData())
        return true;
    if (_fd < 0)
        return false;
    ssize_t n = _outBuffer.writeToFd(_fd);
    if (n < 0) {
        if (errno == EAGAIN || errno == EWOULDBLOCK)
            return true;
        if (errno != EPIPE && errno != ECONNRESET)
            std::cerr << "write(" << _fd << ") failed: " << strerror(errno) << std::endl;
        disconnect();
        return false;
    }
    return true;
}

void Client::disconnect()
{
    if (_fd >= 0) {
        if (close(_fd) < 0)
            std::cerr << "close(" << _fd << ") failed: " << strerror(errno) << std::endl;
        _fd = -1;
    }
    _state = ClientState::DEAD;
}
