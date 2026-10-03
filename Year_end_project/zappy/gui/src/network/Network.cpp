#include "network/Network.hpp"

Network::Network(const std::string &host, int port) : _host(host), _port(port), _socketFd(-1) {}

Network::~Network() {
    if (_socketFd != -1) {
        close(_socketFd);
    }
}

bool Network::connect() {
    struct hostent *server = gethostbyname(_host.c_str());
    if (!server) 
        return false;

    _socketFd = socket(AF_INET, 
        SOCK_STREAM, 
        0);
    if (_socketFd < 0)
        return false;
    struct sockaddr_in server_addr; 
    memset(&server_addr, 0, sizeof(server_addr)); 
    server_addr.sin_family = AF_INET; 
    server_addr.sin_port = htons(_port); 
    memcpy(&server_addr.sin_addr.s_addr, server->h_addr, server->h_length); 

    if (::connect(_socketFd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0)
        return false;
    fcntl(_socketFd, F_SETFL, O_NONBLOCK); 
    return true;
}

void Network::send(const std::string &message) {
    if (_socketFd != -1) {
        ::send(_socketFd, message.c_str(), message.size(), 0);
    }
}

std::string Network::receive() {
    char buffer[1024];
    ssize_t bytesRead = recv(_socketFd, buffer, sizeof(buffer) - 1, 0);
    if (bytesRead > 0) 
        return std::string(buffer, bytesRead);
    return "";
}

int Network::getFd() const {
    return _socketFd;
}