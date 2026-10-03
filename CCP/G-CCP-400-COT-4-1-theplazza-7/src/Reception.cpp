/*
** EPITECH PROJECT, 2026
** reception
** File description:
** reception
*/

#include "Reception.hpp"
#include "PlazzaException.hpp"
#include "ipc/IpcMessage.hpp"

#include <iostream>
#include <poll.h>
#include <sys/wait.h>
#include <unistd.h>

Reception::Reception(Settings settings) : _settings(settings) {}

int Reception::run()
{
    std::cout << "Plazza reception ready. Type orders or 'status'." << std::endl;
    std::cout << "> " << std::flush;

    while (_running) {
        struct pollfd pfd;
        pfd.fd = STDIN_FILENO;
        pfd.events = POLLIN;

        int ret = ::poll(&pfd, 1, 1000);
        if (ret < 0)
            break;

        reapKitchens();

        if (ret == 0)
            continue;

        std::string line;
        if (!std::getline(std::cin, line))
            break;
        if (line.empty()) {
            std::cout << "> " << std::flush;
            continue;
        }
        handleLine(line);
        if (_running)
            std::cout << "> " << std::flush;
    }

    shutdownAllKitchens();
    waitForAllKitchens();
    return 0;
}

void Reception::shutdownAllKitchens()
{
    for (auto &kitchen : _kitchens) {
        if (kitchen.channel)
            kitchen.channel->send(buildShutdownMessage());
    }
}

void Reception::waitForAllKitchens()
{
    for (auto &kitchen : _kitchens) {
        if (kitchen.pid > 0)
            ::waitpid(kitchen.pid, nullptr, 0);
    }
}

void Reception::handleLine(const std::string &line)
{
    if (line == "status") {
        showStatus();
        return;
    }

    if (line == "exit") {
        _running = false;
        return;
    }

    std::vector<PizzaOrder> orders;
    std::string error;
    if (!Parser::parse(line, orders, error)) {
        std::cerr << "Invalid order: " << error << std::endl;
        return;
    }
    handleOrder(orders);
}

void Reception::handleOrder(const std::vector<PizzaOrder> &orders)
{
    for (const PizzaOrder &order : orders) {
        for (int i = 0; i < order.quantity; ++i)
            dispatchPizza(Pizza(order.type, order.size));
    }
}

bool Reception::kitchenHasFreeSlot(const KitchenSlot &kitchen) const
{
    if (kitchen.pid <= 0)
        return false;
    return kitchen.pending < maxPizzasPerKitchen();
}

std::size_t Reception::maxPizzasPerKitchen() const
{
    return 2 * _settings.cooksPerKitchen;
}

void Reception::cleanupEstimates(KitchenSlot &kitchen)
{
    auto now = std::chrono::steady_clock::now();
    while (!kitchen.doneEstimates.empty() && kitchen.doneEstimates.front() <= now) {
        kitchen.doneEstimates.pop_front();
        if (kitchen.pending > 0)
            --kitchen.pending;
    }
}

Reception::KitchenSlot *Reception::findKitchenWithMostFreeSlots()
{
    KitchenSlot *best = nullptr;
    for (KitchenSlot &kitchen : _kitchens) {
        cleanupEstimates(kitchen);
        if (!kitchenHasFreeSlot(kitchen))
            continue;
        if (!best || kitchen.pending < best->pending)
            best = &kitchen;
    }
    return best;
}

void Reception::sendPizzaToKitchen(KitchenSlot &kitchen, const Pizza &pizza)
{
    try {
        kitchen.channel->send(buildPizzaMessage(pizza.pack()));
    } catch (const std::exception &e) {
        std::cerr << "Failed to send to kitchen " << kitchen.pid << ": "
                  << e.what() << std::endl;
        return;
    }
    ++kitchen.pending;
    auto done = std::chrono::steady_clock::now()
        + std::chrono::milliseconds(pizza.getCookTimeMs(_settings.cookingMultiplier));
    kitchen.doneEstimates.push_back(done);
    std::cout << "Dispatch " << pizza.getName() << " to kitchen pid " << kitchen.pid
              << std::endl;
}

void Reception::dispatchPizza(const Pizza &pizza)
{
    KitchenSlot *slot = findKitchenWithMostFreeSlots();
    if (!slot) {
        spawnKitchen();
        slot = findKitchenWithMostFreeSlots();
    }
    if (!slot || !slot->channel) {
        std::cerr << "Unable to dispatch pizza" << std::endl;
        return;
    }
    sendPizzaToKitchen(*slot, pizza);
}

void Reception::showStatus()
{
    if (_kitchens.empty()) {
        std::cout << "No kitchen running." << std::endl;
        return;
    }

    int index = 1;
    for (KitchenSlot &kitchen : _kitchens) {
        cleanupEstimates(kitchen);
        std::cout << "Kitchen #" << index++ << " (pid " << kitchen.pid
                  << ") pending: " << kitchen.pending << " / "
                  << maxPizzasPerKitchen() << std::endl;
    }
}

void Reception::spawnKitchen()
{
    IpcChannel *channel = new IpcChannel();

    const Kitchen::Config config{
        _settings.cookingMultiplier,
        _settings.cooksPerKitchen,
        _settings.regenIntervalMs,
    };

    const pid_t pid = ::fork();
    if (pid < 0) {
        std::perror("fork");
        delete channel;
        return;
    }

    if (pid == 0) {
        channel->openReadEnd();
        {
            Kitchen kitchen(config, *channel);
        }
        delete channel;
        _exit(0);
    }

    channel->openWriteEnd();

    KitchenSlot slot;
    slot.pid = pid;
    slot.channel = channel;
    _kitchens.push_back(std::move(slot));
    std::cout << "Opened kitchen #" << _nextKitchenId++ << " (pid " << pid << ")"
              << std::endl;
}

void Reception::reapKitchens()
{
    for (auto it = _kitchens.begin(); it != _kitchens.end();) {
        int status = 0;
        const pid_t result = ::waitpid(it->pid, &status, WNOHANG);
        if (result > 0) {
            delete it->channel;
            it->channel = nullptr;
            it = _kitchens.erase(it);
        } else {
            ++it;
        }
    }
}

Reception::~Reception()
{
    for (auto &kitchen : _kitchens)
        delete kitchen.channel;
}
