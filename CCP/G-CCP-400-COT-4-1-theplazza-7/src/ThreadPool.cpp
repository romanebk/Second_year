/*
** EPITECH PROJECT, 2026
** threadpool
** File description:
** threadpool
*/

#include "ThreadPool.hpp"
#include "sync/LockGuard.hpp"

ThreadPool::ThreadPool(std::size_t workerCount)
{
    for (std::size_t i = 0; i < workerCount; ++i)
        _workers.push_back(new Thread([this] { workerLoop(); }));
}

ThreadPool::~ThreadPool()
{
    stop();
}

void ThreadPool::enqueue(std::function<void()> task)
{
    LockGuard guard(_mutex);
    _tasks.push_back(std::move(task));
    _cv.notifyOne();
}

void ThreadPool::stop()
{
    {
        LockGuard guard(_mutex);
        if (!_running)
            return;
        _running = false;
    }
    _cv.notifyAll();
    for (Thread *worker : _workers) {
        if (worker->joinable())
            worker->join();
        delete worker;
    }
    _workers.clear();
}

void ThreadPool::popNextTask(std::function<void()> &task)
{
    task = std::move(_tasks.front());
    _tasks.pop_front();
}

bool ThreadPool::waitForTask(std::function<void()> &task)
{
    LockGuard guard(_mutex);
    while (_running && _tasks.empty())
        _cv.wait(_mutex);
    if (_tasks.empty())
        return false;
    popNextTask(task);
    return true;
}

void ThreadPool::workerLoop()
{
    while (true) {
        std::function<void()> task;
        if (!waitForTask(task))
            return;
        if (task)
            task();
    }
}
