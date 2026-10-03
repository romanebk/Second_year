#include "../../include/network/RingBuffer.hpp"
#include <unistd.h>
#include <sys/socket.h>
#include <cerrno>

ssize_t RingBuffer::readFromFd(int fd)
{
    char buf[4096];
    ssize_t n = read(fd, buf, sizeof(buf));
    if (n > 0)
        _buffer.append(buf, n);
    return n;
}

ssize_t RingBuffer::writeToFd(int fd)
{
    if (_buffer.empty()) {
        errno = ENOENT;
        return -1;
    }
    ssize_t n = write(fd, _buffer.data(), _buffer.size());
    if (n > 0)
        _buffer.erase(0, n);
    return n;
}

bool RingBuffer::push(const char *data, size_t len)
{
    _buffer.append(data, len);
    return true;
}

bool RingBuffer::push(const std::string &data)
{
    _buffer.append(data);
    return true;
}

bool RingBuffer::hasLine() const
{
    return _buffer.find('\n') != std::string::npos;
}

std::string RingBuffer::popLine()
{
    auto pos = _buffer.find('\n');
    if (pos == std::string::npos)
        return {};
    std::string line = _buffer.substr(0, pos);
    _buffer.erase(0, pos + 1);
    if (!line.empty() && line.back() == '\r')
        line.pop_back();
    return line;
}
