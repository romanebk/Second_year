#ifndef SERVER_HPP_
#define SERVER_HPP_

#include "../interfaces/IServer.hpp"
#include "Client.hpp"
#include <vector>
#include <poll.h>
#include <memory>
#include <functional>

class Server : public IServer {
    public:
        Server() = default;
        ~Server() override;

        bool init(int port) override;
        void run(int timeoutMs = -1) override;
        void stop() override;
        bool isRunning() const override { return _running; }

        void setOnConnect(std::function<void(Client &)> cb) { _onConnect = cb; }
        void setOnDisconnect(std::function<void(Client &)> cb) { _onDisconnect = cb; }
        void setOnData(std::function<void(Client &)> cb) { _onData = cb; }

        Client *getClient(int fd);
        void disconnectClient(int fd);
        const std::vector<std::unique_ptr<Client>> &getClients() const { return _clients; }

    private:
        int _serverFd = -1;
        bool _running = false;
        std::vector<std::unique_ptr<Client>> _clients;
        std::vector<struct pollfd> _pollFds;

        std::function<void(Client &)> _onConnect;
        std::function<void(Client &)> _onDisconnect;
        std::function<void(Client &)> _onData;

        void rebuildPollFds();
        void acceptNewClient();
        void handleClientData(size_t index);
        void removeClient(Client *client);
};

#endif
