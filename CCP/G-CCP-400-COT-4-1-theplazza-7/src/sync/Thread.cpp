/*
** EPITECH PROJECT, 2026
** thread
** File description:
** thread
*/

#include "sync/Thread.hpp"
#include "PlazzaException.hpp"

Thread::Thread(std::function<void()> entry)
    : active(true)
{
    auto *fn = new std::function<void()>(std::move(entry));
    if (pthread_create(&thread, nullptr, &Thread::trampoline, fn) != 0) {
        delete fn;
        throw SyncException("pthread_create failed");
    }
}

Thread::~Thread()
{
    if (active)
        join();
}

void Thread::join()
{
    if (!active)
        return;
    pthread_join(thread, nullptr);
    active = false;
}

bool Thread::joinable() const
{
    return active;
}

void *Thread::trampoline(void *arg)
{
    auto *fn = static_cast<std::function<void()> *>(arg);
    (*fn)();
    delete fn;
    return nullptr;
}
