/*
** EPITECH PROJECT, 2026
** reception
** File description:
** reception
*/

#ifndef RECEPTION_H
    #define RECEPTION_H

#include "Kitchen.hpp"
#include "Parser.hpp"
#include "ipc/IpcChannel.hpp"

#include <chrono>
#include <deque>
#include <string>
#include <sys/types.h>
#include <vector>

class Reception {
public:
    struct Settings {
        double cookingMultiplier;
        std::size_t cooksPerKitchen;
        int regenIntervalMs;
    };

    explicit Reception(Settings settings);
    ~Reception();

    int run();

private:
    struct KitchenSlot {
        pid_t pid{-1};
        IpcChannel *channel{nullptr};
        std::size_t pending{0};
        std::deque<std::chrono::steady_clock::time_point> doneEstimates;
    };

    void handleLine(const std::string &line);
    void handleOrder(const std::vector<PizzaOrder> &orders);
    void dispatchPizza(const Pizza &pizza);
    void sendPizzaToKitchen(KitchenSlot &kitchen, const Pizza &pizza);
    void showStatus();
    void spawnKitchen();
    void reapKitchens();
    void shutdownAllKitchens();
    void waitForAllKitchens();

    void cleanupEstimates(KitchenSlot &kitchen);
    bool kitchenHasFreeSlot(const KitchenSlot &kitchen) const;
    std::size_t maxPizzasPerKitchen() const;
    KitchenSlot *findKitchenWithMostFreeSlots();

    Settings _settings;
    std::vector<KitchenSlot> _kitchens;
    int _nextKitchenId{1};
    bool _running{true};
};

#endif
