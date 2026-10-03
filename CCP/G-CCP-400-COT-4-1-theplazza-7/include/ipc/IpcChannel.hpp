/*
** EPITECH PROJECT, 2026
** channel
** File description:
** channel
*/

#ifndef PANORAMIX_H
    #define PANORAMIX_H

#include <cstddef>
#include <cstdint>
#include <string>
#include <vector>

class IpcChannel {
public:
    IpcChannel();
    ~IpcChannel();

    IpcChannel(const IpcChannel &) = delete;
    IpcChannel &operator=(const IpcChannel &) = delete;
    IpcChannel(IpcChannel &&) = delete;
    IpcChannel &operator=(IpcChannel &&) = delete;

    int readFd() const;
    int writeFd() const;

    void openReadEnd();
    void openWriteEnd();
    void closeWriteEnd();
    void closeReadEnd();

    const std::string &getPath() const;

    void send(const std::vector<std::uint8_t> &buffer);
    void receive(std::vector<std::uint8_t> &buffer);

    IpcChannel &operator<<(const std::vector<std::uint8_t> &buffer);
    IpcChannel &operator>>(std::vector<std::uint8_t> &buffer);

private:
    bool writeAll(const void *data, std::size_t size);
    bool readAll(void *data, std::size_t size);

    std::string path;
    int rfd{-1};
    int wfd{-1};
};

#endif
