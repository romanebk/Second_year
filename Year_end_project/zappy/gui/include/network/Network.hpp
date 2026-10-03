#ifndef Network_HPP
#define Network_HPP

#include <string>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>
#include <unistd.h>
#include <fcntl.h>
#include <cstring>

class Network
{
    public:
        Network(const std::string &host, int port);
        ~Network();

        bool connect();
        void send(const std::string &message);
        std::string receive();
        int getFd() const;
    private:
        std::string _host;
        int _port;
        int _socketFd;
};

#endif