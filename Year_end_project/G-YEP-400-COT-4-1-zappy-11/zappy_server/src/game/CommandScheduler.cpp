/*
** EPITECH PROJECT, 2026
** CommandScheduler.cpp
** File description:
** Command scheduler implementation
*/#include "../../include/game/CommandScheduler.hpp"
#include "../../include/common/Constants.hpp"
#include <algorithm>

CommandScheduler::CommandScheduler(int freq) : _freq(freq) {}

bool CommandScheduler::schedule(Player *player, ActionType type,
                                 const std::vector<std::string> &args)
{
    int count = 0;
    double cumulativeTime = 0;
    auto copy = _queue;
    while (!copy.empty()) {
        if (copy.top().player == player) {
            count++;
            cumulativeTime = copy.top().remainingTime;
        }
        copy.pop();
    }
    if (count >= Constants::MAX_COMMANDS_QUEUED)
        return false;

    double time = getActionTime(type);
    _queue.push({player, type, args, cumulativeTime + time, _nextId++});
    return true;
}

void CommandScheduler::update(double deltaTime)
{
    if (_queue.empty())
        return;

    std::vector<ScheduledAction> temp;
    while (!_queue.empty()) {
        auto action = _queue.top();
        _queue.pop();
        action.remainingTime -= deltaTime;
        if (action.remainingTime <= 0) {
            if (action.player && !action.player->isDead() && _onActionReady)
                _onActionReady(action.player, action.type, action.args);
        } else {
            temp.push_back(action);
        }
    }

    for (auto &a : temp)
        _queue.push(a);
}

double CommandScheduler::getTimeUntilNextAction() const
{
    if (_queue.empty())
        return -1;
    return _queue.top().remainingTime;
}

bool CommandScheduler::hasActionsForPlayer(Player *player) const
{
    auto copy = _queue;
    while (!copy.empty()) {
        if (copy.top().player == player)
            return true;
        copy.pop();
    }
    return false;
}

void CommandScheduler::clearPlayerActions(Player *player)
{
    std::vector<ScheduledAction> temp;
    while (!_queue.empty()) {
        auto action = _queue.top();
        _queue.pop();
        if (action.player != player)
            temp.push_back(action);
    }
    for (auto &a : temp)
        _queue.push(a);
}

double CommandScheduler::getActionTime(ActionType type) const
{
    int idx = static_cast<int>(type);
    if (idx < 0 || idx >= static_cast<int>(ActionType::NONE))
        return 0;
    if (_freq <= 0)
        return 0;
    return static_cast<double>(Constants::ACTION_TIME[idx]) / _freq;
}
