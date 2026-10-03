/*
** EPITECH PROJECT, 2026
** kitchen
** File description:
** kitchen
*/

#include "Kitchen.hpp"
#include "ipc/IpcMessage.hpp"
#include "sync/LockGuard.hpp"

#include <iostream>
#include <poll.h>
#include <thread>
#include <unistd.h>

Kitchen::Kitchen(const Config &config, IpcChannel &channel)
    : _config(config),
      _channel(channel),
      _pool(config.cookCount),
      _lastActivity(std::chrono::steady_clock::now())
{
    run();
}

Kitchen::~Kitchen()
{
    _pool.stop();
    if (_regenThread) {
        if (_regenThread->joinable())
            _regenThread->join();
        delete _regenThread;
    }
}

std::size_t Kitchen::pendingPizzas() const
{
    return _pending.load();
}

std::size_t Kitchen::maxCapacity() const
{
    return 2 * _config.cookCount;
}

bool Kitchen::canAccept(std::size_t count) const
{
    return _pending.load() + count <= maxCapacity();
}

IngredientStock Kitchen::stockSnapshot() const
{
    return _stock.snapshot();
}

void Kitchen::startRegenerationThread()
{
    _regenThread = new Thread([this] {
        while (_regenRunning.load()) {
            std::this_thread::sleep_for(
                std::chrono::milliseconds(_config.regenIntervalMs));
            if (_regenRunning.load())
                _stock.regenerate();
        }
    });
}

bool Kitchen::readNextMessage(std::vector<std::uint8_t> &raw)
{
    // Ne fermer que si aucune pizza en cours ET idle depuis 5s
    if (_pending.load() == 0) {
        auto idleMs = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - _lastActivity).count();
        if (idleMs >= 5000)
            return false;
    }

    struct pollfd pfd;
    pfd.fd = _channel.readFd();
    pfd.events = POLLIN;

    int timeoutMs = -1;  // infini si des pizzas cuisent
    if (_pending.load() == 0) {
        auto idleMs = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::steady_clock::now() - _lastActivity).count();
        timeoutMs = static_cast<int>(std::max(0LL, 5000LL - idleMs));
    }

    int ret = ::poll(&pfd, 1, timeoutMs);
    if (ret <= 0)
        return false;

    try {
        _channel.receive(raw);
        return true;
    } catch (...) {
        return false;
    }
}
void Kitchen::enqueuePizza(const Pizza &pizza)
{
    ++_pending;
    touchActivity();
    _pool.enqueue([this, pizza] { handlePizza(pizza); });
}

void Kitchen::handleIncomingMessage(const std::vector<std::uint8_t> &raw)
{
    if (raw.empty())
        return;
    if (readMessageKind(raw) != IpcMessageKind::Pizza)
        return;

    const std::vector<std::uint8_t> payload = extractPizzaPayload(raw);
    if (payload.empty())
        return;

    const Pizza pizza = Pizza::unpack(payload);
    if (!canAccept(1)) {
        std::cerr << "Kitchen: at capacity, dropping pizza " << pizza.getName() << std::endl;
        return;
    }
    enqueuePizza(pizza);
}

void Kitchen::run()
{
    startRegenerationThread();

    while (true) {
        std::vector<std::uint8_t> raw;
        if (!readNextMessage(raw))
            break;
        if (readMessageKind(raw) == IpcMessageKind::Shutdown)
            break;
        handleIncomingMessage(raw);
    }

    _regenRunning = false;
    _pool.stop();
    if (_regenThread && _regenThread->joinable())
        _regenThread->join();
}

void Kitchen::waitForIngredients(const Pizza &pizza)
{
    while (!_stock.takeFor(pizza.getType()))
        std::this_thread::sleep_for(std::chrono::milliseconds(50));
}

void Kitchen::cookPizza(const Pizza &pizza)
{
    const int cookMs = pizza.getCookTimeMs(_config.cookingMultiplier);
    std::this_thread::sleep_for(std::chrono::milliseconds(cookMs));
}

void Kitchen::markPizzaDone()
{
    --_pending;
    touchActivity();
}

void Kitchen::printReady(const Pizza &pizza)
{
    LockGuard guard(_coutMutex);
    std::cout << "Kitchen: " << pizza.getName() << " is ready" << std::endl;
}

void Kitchen::handlePizza(const Pizza &pizza)
{
    waitForIngredients(pizza);
    cookPizza(pizza);
    printReady(pizza);
    markPizzaDone();
}

void Kitchen::touchActivity()
{
    _lastActivity = std::chrono::steady_clock::now();
}
