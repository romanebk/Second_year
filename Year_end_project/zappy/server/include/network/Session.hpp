#ifndef SESSION_HPP_
#define SESSION_HPP_

#include "Client.hpp"
#include "../game/Player.hpp"
#include <string>
#include <functional>

class Session {
    public:
        using TeamNameCallback = std::function<void(Session &, const std::string &)>;

        Session(Client &client);

        void handleWelcome();
        void handleLine(const std::string &line);

        Client &getClient() { return _client; }
        Player *getPlayer() { return _player; }
        void setPlayer(Player *player) { _player = player; }
        bool isGUI() const { return _isGUI; }
        bool isHandshakeDone() const { return _handshakeDone; }

        void setOnTeamName(TeamNameCallback cb) { _onTeamName = cb; }
        void setOnGUI(std::function<void(Session &)> cb) { _onGUI = cb; }
        void setOnAICommand(std::function<void(Session &, const std::string &)> cb) { _onAICommand = cb; }
        void setOnGUICommand(std::function<void(Session &, const std::string &)> cb) { _onGUICommand = cb; }

        void kick();

    private:
        Client &_client;
        Player *_player = nullptr;
        bool _isGUI = false;
        bool _handshakeDone = false;

        TeamNameCallback _onTeamName;
        std::function<void(Session &)> _onGUI;
        std::function<void(Session &, const std::string &)> _onAICommand;
        std::function<void(Session &, const std::string &)> _onGUICommand;

        void handleTeamName(const std::string &teamName);
        void handleGUI();
        void handleAI(const std::string &line);
};

#endif
