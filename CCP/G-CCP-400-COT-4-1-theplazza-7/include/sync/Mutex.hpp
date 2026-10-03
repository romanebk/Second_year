/*
** EPITECH PROJECT, 2026
** mutex
** File description:
** mutex
*/

#ifndef MUTEX_H
    #define MUTEX_H

#include <pthread.h>

class Mutex {
public:
    Mutex();
    ~Mutex();

    Mutex(const Mutex &) = delete;
    Mutex &operator=(const Mutex &) = delete;

    void lock();
    void unlock();
    pthread_mutex_t *nativeHandle();

private:
    pthread_mutex_t mutex{};
};

#endif
