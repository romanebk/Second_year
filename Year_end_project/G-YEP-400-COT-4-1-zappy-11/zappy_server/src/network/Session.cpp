/*
** EPITECH PROJECT, 2026
** Session.cpp
** File description:
** Session handling
*/#include "../../include/network/Session.hpp"

Session::Session(Client &client) : _client(client) {}

void Session::handleWelcome()
{
    _client.pushLine("WELCOME\n");
}

void Session::handleLine(const std::string &line)
{
    if (!_handshakeDone) {
        if (line == "GRAPHIC") {
            _isGUI = true;
            handleGUI();
            _handshakeDone = true;
        } else {
            handleTeamName(line);
            if (_client.getFd() >= 0)
                _handshakeDone = true;
        }
        return;
    }

    if (_isGUI) {
        if (_onGUICommand)
            _onGUICommand(*this, line);
    } else {
        if (_onAICommand)
            _onAICommand(*this, line);
    }
}

void Session::handleTeamName(const std::string &teamName)
{
    _client.setTeamName(teamName);
    if (_onTeamName)
        _onTeamName(*this, teamName);
}

void Session::handleGUI()
{
    _client.setState(ClientState::PLAYING);
    if (_onGUI)
        _onGUI(*this);
}

void Session::handleAI(const std::string &line)
{
    if (_onAICommand)
        _onAICommand(*this, line);
}

void Session::kick()
{
    _client.pushLine("dead\n");
    _client.disconnect();
}
