/*
** EPITECH PROJECT, 2026
** ActionHandler.hpp
** File description:
** Action handler header
*/#ifndef ACTIONHANDLER_HPP_
#define ACTIONHANDLER_HPP_

#include "../interfaces/IMap.hpp"
#include "../common/Enums.hpp"
#include "../common/Structs.hpp"
#include "../network/Session.hpp"
#include "Team.hpp"
#include "Player.hpp"
#include "Egg.hpp"
#include "CommandScheduler.hpp"
#include <vector>
#include <map>
#include <memory>
#include <string>

struct PendingEgg {
    Egg *egg;
    double remainingTime;
};

class ActionHandler {
    public:
        ActionHandler(IMap &map, std::vector<Team> &teams,
                      std::vector<std::unique_ptr<Player>> &players,
                      std::vector<std::unique_ptr<Egg>> &eggs,
                      std::map<int, Session *> &sessions,
                      CommandScheduler &scheduler,
                      std::map<Player *, std::vector<Player *>> &incantationParticipants,
                      std::vector<PendingEgg> &pendingEggs,
                      int &nextEggId, int freq,
                      bool &gameOver, std::string &winner);

        void execute(Player &player, ActionType type, const std::vector<std::string> &args);

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

        void checkWinCondition();
        void checkEggHatches(double deltaTime);
        void cancelIncantation(Player &player);
        void setFreq(int freq) { _freq = freq; }

        Client *getClientByPlayer(Player &player);
        Team *getTeam(const std::string &name);
        Team *getTeamByPlayer(Player &player);
        Player *findPlayer(int id);

        void broadcastToGUI(const std::string &msg);
        void broadcastToAll(const std::string &msg);

    private:
        IMap &_map;
        std::vector<Team> &_teams;
        std::vector<std::unique_ptr<Player>> &_players;
        std::vector<std::unique_ptr<Egg>> &_eggs;
        std::map<int, Session *> &_sessions;
        CommandScheduler &_scheduler;
        std::map<Player *, std::vector<Player *>> &_incantationParticipants;
        std::vector<PendingEgg> &_pendingEggs;
        int &_nextEggId;
        int _freq;
        bool &_gameOver;
        std::string &_winner;

        Session *getSessionByPlayer(Player &player);
};

#endif
