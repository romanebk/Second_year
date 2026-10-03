/*
** EPITECH PROJECT, 2026
** thread
** File description:
** define the thread
*/

#ifndef TRHEAD_H
    #define TRHEAD_H

#include <functional>
#include <pthread.h>

class Thread {
public:
    Thread() = delete;
    explicit Thread(std::function<void()> entry);
    ~Thread();

    Thread(const Thread &) = delete;
    Thread &operator=(const Thread &) = delete;
    Thread(Thread &&) = delete;
    Thread &operator=(Thread &&) = delete;

    void join();
    bool joinable() const;

private:
    static void *trampoline(void *arg);

    pthread_t thread{};
    bool active{false};
};

#endif
