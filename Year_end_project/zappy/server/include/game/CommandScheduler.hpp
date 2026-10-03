#ifndef COMMANDSCHEDULER_HPP_
#define COMMANDSCHEDULER_HPP_

#include "../common/Enums.hpp"
#include "../game/Player.hpp"
#include <queue>
#include <functional>
#include <memory>

struct ScheduledAction {
    Player *player;
    ActionType type;
    std::vector<std::string> args;
    double remainingTime;
    int id;

    bool operator>(const ScheduledAction &other) const {
        return remainingTime > other.remainingTime;
    }
};

class CommandScheduler {
    public:
        CommandScheduler(int freq);

        void schedule(Player *player, ActionType type, const std::vector<std::string> &args);
        void update(double deltaTime);
        double getTimeUntilNextAction() const;
        bool hasActionsForPlayer(Player *player) const;
        void clearPlayerActions(Player *player);

        using ActionCallback = std::function<void(Player *, ActionType, const std::vector<std::string> &)>;
        void setOnActionReady(ActionCallback cb) { _onActionReady = cb; }

    private:
        int _freq;
        int _nextId = 0;
        std::priority_queue<ScheduledAction, std::vector<ScheduledAction>, std::greater<ScheduledAction>> _queue;
        ActionCallback _onActionReady;

        double getActionTime(ActionType type) const;
};

#endif
