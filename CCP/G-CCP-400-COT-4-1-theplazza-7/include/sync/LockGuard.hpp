/*
** EPITECH PROJECT, 2026
** lockguard
** File description:
** lockguard
*/

#ifndef LOCK_GUARD_H
    #define LOCK_GUARD_H

#include "sync/Mutex.hpp"

class LockGuard {
public:
    explicit LockGuard(Mutex &mutex);
    ~LockGuard();

    LockGuard(const LockGuard &) = delete;
    LockGuard &operator=(const LockGuard &) = delete;

private:
    Mutex &mutex;
};

#endif
