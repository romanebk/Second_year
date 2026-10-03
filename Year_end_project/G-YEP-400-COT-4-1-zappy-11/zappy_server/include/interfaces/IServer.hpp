/*
** EPITECH PROJECT, 2026
** IServer.hpp
** File description:
** Server interface
*/#ifndef ISERVER_HPP_
#define ISERVER_HPP_

class IServer {
    public:
        virtual ~IServer() = default;

        virtual bool init(int port) = 0;
        virtual void run(int timeoutMs = -1) = 0;
        virtual void stop() = 0;
        virtual bool isRunning() const = 0;
};

#endif
