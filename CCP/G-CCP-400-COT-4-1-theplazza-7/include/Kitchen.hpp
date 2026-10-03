/*
** EPITECH PROJECT, 2026
** kitchen
** File description:
** kitchen
*/

#ifndef KITCHEN_H
    #define KITCHEN_H

#include "Pizza.hpp"
#include "Stock.hpp"
#include "ThreadPool.hpp"
#include "ipc/IpcChannel.hpp"
#include "sync/Mutex.hpp"
#include "sync/Thread.hpp"
#include <atomic>
#include <chrono>

class Kitchen {
public:
    struct Config {
        double cookingMultiplier;
        std::size_t cookCount;
        int regenIntervalMs;
    };

    Kitchen(const Config &config, IpcChannel &channel);
    ~Kitchen();

    Kitchen(const Kitchen &) = delete;
    Kitchen &operator=(const Kitchen &) = delete;

    std::size_t pendingPizzas() const;
    std::size_t maxCapacity() const;
    bool canAccept(std::size_t count) const;
    IngredientStock stockSnapshot() const;

private:
    void run();
    void startRegenerationThread();
    bool readNextMessage(std::vector<std::uint8_t> &raw);
    void handleIncomingMessage(const std::vector<std::uint8_t> &raw);
    void enqueuePizza(const Pizza &pizza);
    void handlePizza(const Pizza &pizza);
    void waitForIngredients(const Pizza &pizza);
    void cookPizza(const Pizza &pizza);
    void markPizzaDone();
    void touchActivity();
    void printReady(const Pizza &pizza);

    Config _config;
    IpcChannel &_channel;
    ThreadPool _pool;
    Stock _stock;
    Mutex _coutMutex;
    std::atomic<std::size_t> _pending{0};
    std::atomic<bool> _regenRunning{true};
    std::chrono::steady_clock::time_point _lastActivity;
    Thread *_regenThread{nullptr};
};

#endif
