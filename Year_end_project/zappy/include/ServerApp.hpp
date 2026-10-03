#ifndef SERVERAPP_HPP_
#define SERVERAPP_HPP_

#include "interfaces/IGameEngine.hpp"
#include "network/Server.hpp"
#include "network/Session.hpp"
#include "game/Map.hpp"
#include "game/Team.hpp"
#include "game/Player.hpp"
#include "game/Egg.hpp"
#include "game/ResourceManager.hpp"
#include "game/CommandScheduler.hpp"
#include <vector>
#include <memory>
#include <map>

class ServerApp : public IGameEngine {
    public:
        ServerApp() = default;
        ~ServerApp() override;

        void init(int width, int height, const std::vector<std::string> &teams, int clientsPerTeam, int freq) override;
        bool initNetwork(int port);
        void run();
        void stop();

        int getWidth() const override { return _map ? _map->getWidth() : 0; }
        int getHeight() const override { return _map ? _map->getHeight() : 0; }
        int getFreq() const override { return _freq; }
        void update(double deltaTime) override;
        double getTimeUntilNextEvent() const override;
        bool isGameOver() const override { return _gameOver; }
        const std::string &getWinner() const override { return _winner; }

    private:
        Server _server;
        Map *_map = nullptr;
        ResourceManager *_resourceManager = nullptr;
        CommandScheduler *_scheduler = nullptr;

        std::vector<Team> _teams;
        std::vector<std::unique_ptr<Player>> _players;
        std::vector<Egg> _eggs;
        std::map<int, Session *> _sessions;

        int _freq = 100;
        int _nextPlayerId = 0;
        int _nextEggId = 0;
        bool _gameOver = false;
        std::string _winner;
        bool _running = false;
        double _resourceTimer = 0;
        double _foodTimer = 0;

        void onConnect(Client &client);
        void onDisconnect(Client &client);
        void onData(Client &client);
        void onActionReady(Player *player, ActionType type, const std::vector<std::string> &args);

        void handleTeamJoin(Session &session, const std::string &teamName);
        void handleGUIConnect(Session &session);
        void handleAICommand(Session &session, const std::string &line);
        void handleGUICommand(Session &session, const std::string &line);

        void handleForward(Player &player);
        void handleRight(Player &player);
        void handleLeft(Player &player);
        void handleLook(Player &player);
        void handleInventory(Player &player);
        void handleBroadcast(Player &player, const std::string &msg);
        void handleConnectNbr(Player &player);
        void handleFork(Player &player);
        void handleEject(Player &player);
        void handleTake(Player &player, const std::string &obj);
        void handleSet(Player &player, const std::string &obj);
        void handleIncantation(Player &player);

        Session *getSessionByPlayer(Player &player);
        Client *getClientByPlayer(Player &player);
        Team *getTeam(const std::string &name);
        Team *getTeamByPlayer(Player &player);
        Player *findPlayer(int id);
        void checkWinCondition();

        void broadcastToGUI(const std::string &msg);
        void broadcastToAll(const std::string &msg);
};

#endif
