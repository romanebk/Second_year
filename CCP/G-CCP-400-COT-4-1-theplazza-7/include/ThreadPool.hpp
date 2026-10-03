/*
** EPITECH PROJECT, 2026
** threadpool
** File description:
** threadpool
*/

#ifndef THREAD_POOL_H
    #define THREAD_POOL_H

#include "sync/ConditionVariable.hpp"
#include "sync/Mutex.hpp"
#include "sync/Thread.hpp"

#include <deque>
#include <functional>
#include <vector>

class ThreadPool {
public:
    explicit ThreadPool(std::size_t workerCount);
    ~ThreadPool();

    ThreadPool(const ThreadPool &) = delete;
    ThreadPool &operator=(const ThreadPool &) = delete;

    void enqueue(std::function<void()> task);
    void stop();

private:
    void workerLoop();
    bool waitForTask(std::function<void()> &task);
    void popNextTask(std::function<void()> &task);

    std::vector<Thread *> _workers;
    std::deque<std::function<void()>> _tasks;
    Mutex _mutex;
    ConditionVariable _cv;
    bool _running{true};
};

#endif
