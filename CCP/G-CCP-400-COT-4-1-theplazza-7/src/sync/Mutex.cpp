/*
** EPITECH PROJECT, 2026
** mutex
** File description:
** mutex
*/

#include "sync/Mutex.hpp"
#include "PlazzaException.hpp"

Mutex::Mutex()
{
    if (pthread_mutex_init(&mutex, nullptr) != 0)
        throw SyncException("pthread_mutex_init failed");
}

Mutex::~Mutex()
{
    pthread_mutex_destroy(&mutex);
}

void Mutex::lock()
{
    if (pthread_mutex_lock(&mutex) != 0)
        throw SyncException("pthread_mutex_lock failed");
}

void Mutex::unlock()
{
    if (pthread_mutex_unlock(&mutex) != 0)
        throw SyncException("pthread_mutex_unlock failed");
}

pthread_mutex_t *Mutex::nativeHandle()
{
    return &mutex;
}
