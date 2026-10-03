#ifndef CLIENT_HPP_
#define CLIENT_HPP_

#include "CircularBuffer.hpp"
#include "../common/Enums.hpp"
#include <string>
#include <functional>

class Client {
    public:
        Client(int fd);
        ~Client();

        int getFd() const { return _fd; }
        int getOrigFd() const { return _origFd; }
        ClientState getState() const { return _state; }
        void setState(ClientState state) { _state = state; }

        void onReadable();
        void onWritable();

        bool hasLine() const;
        std::string popLine();
        void pushLine(const std::string &line);

        bool sendData();
        bool hasPendingData() const { return !_outBuffer.empty(); }

        void setTeamName(const std::string &name) { _teamName = name; }
        const std::string &getTeamName() const { return _teamName; }

        void setPlayerId(int id) { _playerId = id; }
        int getPlayerId() const { return _playerId; }

        void disconnect();

    private:
        int _fd;
        int _origFd;
        ClientState _state;
        CircularBuffer<4096> _inBuf;
        std::string _lineBuffer;
        std::string _outBuffer;
        std::string _teamName;
        int _playerId;
};

#endif
