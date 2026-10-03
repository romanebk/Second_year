/*
** EPITECH PROJECT, 2026
** channel
** File description:
** channel
*/

#include "ipc/IpcChannel.hpp"
#include "PlazzaException.hpp"
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>

static int nextId()
{
    static int id = 0;
    return ++id;
}

static std::string makePath(int id)
{
    return "/tmp/plazza_ipc_" + std::to_string(getpid()) + "_" + std::to_string(id);
}

static void closefd(int &fd)
{
    if (fd >= 0) {
        ::close(fd);
        fd = -1;
    }
}

IpcChannel::IpcChannel()
    : path(makePath(nextId()))
{
    ::unlink(path.c_str());
    if (mkfifo(path.c_str(), 0600) != 0)
        throw IpcException("mkfifo failed: " + path);
}

IpcChannel::~IpcChannel()
{
    closefd(rfd);
    closefd(wfd);
    if (!path.empty())
        ::unlink(path.c_str());
}

void IpcChannel::openReadEnd()
{
    rfd = ::open(path.c_str(), O_RDONLY);
    if (rfd < 0)
        throw IpcException("open read end failed: " + path);
}

void IpcChannel::openWriteEnd()
{
    wfd = ::open(path.c_str(), O_WRONLY);
    if (wfd < 0)
        throw IpcException("open write end failed: " + path);
}

int IpcChannel::readFd() const
{
    return rfd;
}

int IpcChannel::writeFd() const
{
    return wfd;
}

void IpcChannel::closeWriteEnd()
{
    closefd(wfd);
}

void IpcChannel::closeReadEnd()
{
    closefd(rfd);
}

const std::string &IpcChannel::getPath() const
{
    return path;
}

bool IpcChannel::writeAll(const void *data, std::size_t size)
{
    const char *bytes = static_cast<const char *>(data);
    std::size_t done = 0;

    while (done < size) {
        ssize_t ret = ::write(wfd, bytes + done, size - done);
        if (ret <= 0)
            return false;
        done += static_cast<std::size_t>(ret);
    }
    return true;
}

bool IpcChannel::readAll(void *data, std::size_t size)
{
    char *bytes = static_cast<char *>(data);
    std::size_t done = 0;

    while (done < size) {
        ssize_t ret = ::read(rfd, bytes + done, size - done);
        if (ret <= 0)
            return false;
        done += static_cast<std::size_t>(ret);
    }
    return true;
}

void IpcChannel::send(const std::vector<std::uint8_t> &buffer)
{
    auto size = static_cast<std::uint32_t>(buffer.size());
    if (!writeAll(&size, sizeof(size)))
        throw IpcException("ipc send size failed");
    if (!writeAll(buffer.data(), buffer.size()))
        throw IpcException("ipc send data failed");
}

void IpcChannel::receive(std::vector<std::uint8_t> &buffer)
{
    std::uint32_t size = 0;
    if (!readAll(&size, sizeof(size)))
        throw IpcException("ipc receive size failed");
    buffer.resize(size);
    if (size > 0 && !readAll(buffer.data(), size))
        throw IpcException("ipc receive data failed");
}

IpcChannel &IpcChannel::operator<<(const std::vector<std::uint8_t> &buffer)
{
    send(buffer);
    return *this;
}

IpcChannel &IpcChannel::operator>>(std::vector<std::uint8_t> &buffer)
{
    receive(buffer);
    return *this;
}
