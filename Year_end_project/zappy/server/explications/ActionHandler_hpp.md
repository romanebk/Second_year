# `include/game/ActionHandler.hpp` — Header du gestionnaire d'actions

Point central qui connecte toutes les actions des joueurs aux systèmes de jeu.

---

```cpp
struct PendingEgg {
    Egg *egg;
    double remainingTime;
};
```
**Lignes 17-20** — Structure pour le compteur d'éclosion : un pointeur vers l'œuf et le temps restant avant éclosion.

```cpp
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
        // ... toutes les handlers d'action
        void handleIncantation(Player &player);

        void checkWinCondition();
        void checkEggHatches(double deltaTime);

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
```
**Lignes 22-75** — `ActionHandler` est le hub central. Il reçoit toutes les références par constructeur (pas de ownership, que des références). Le cœur est `execute()` qui dispatche via un switch. Chaque `handle*` méthode implémente une action. Les méthodes privées `getSessionByPlayer`/`getClientByPlayer` gèrent la communication avec les clients.
