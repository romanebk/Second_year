#include "../../include/network/Client.hpp"
#include <unistd.h>
#include <sys/socket.h>

Client::Client(int fd)
    : _fd(fd), _origFd(fd), _state(ClientState::AWAITING_TEAM), _playerId(-1) {}

Client::~Client() { disconnect(); }

void Client::onReadable()
{
    char buf[1024];
    ssize_t n = read(_fd, buf, sizeof(buf));
    if (n <= 0) {
        disconnect();
        return;
    }
    _inBuf.push(buf, n);
}

void Client::onWritable()
{
    if (!_outBuffer.empty())
        sendData();
}

bool Client::hasLine() const
{
    CircularBuffer<4096> tmp = _inBuf;
    char c;
    while (tmp.size() > 0) {
        tmp.pop(&c, 1);
        if (c == '\n')
            return true;
    }
    return false;
}

std::string Client::popLine()
{
    std::string line;
    char c;
    while (_inBuf.size() > 0) {
        _inBuf.pop(&c, 1);
        if (c == '\n')
            break;
        if (c != '\r')
            line += c;
    }
    return line;
}

void Client::pushLine(const std::string &line)
{
    _outBuffer += line;
    sendData();
}

bool Client::sendData()
{
    if (_outBuffer.empty())
        return true;
    ssize_t n = write(_fd, _outBuffer.data(), _outBuffer.size());
    if (n <= 0) {
        disconnect();
        return false;
    }
    _outBuffer.erase(0, n);
    return true;
}

void Client::disconnect()
{
    if (_fd >= 0) {
        close(_fd);
        _fd = -1;
    }
    _state = ClientState::DEAD;
}
