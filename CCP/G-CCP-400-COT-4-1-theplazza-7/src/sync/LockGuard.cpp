/*
** EPITECH PROJECT, 2026
** lockguard
** File description:
** lockguard
*/

#include "sync/LockGuard.hpp"

LockGuard::LockGuard(Mutex &m) : mutex(m)
{
    mutex.lock();
}

LockGuard::~LockGuard()
{
    mutex.unlock();
}
