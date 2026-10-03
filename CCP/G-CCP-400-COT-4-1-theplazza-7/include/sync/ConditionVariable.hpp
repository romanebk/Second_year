/*
** EPITECH PROJECT, 2026
** conditionvariable
** File description:
** conditionvariable
*/

#ifndef CONDITION_VARIABLE_H
    #define CONDITION_VARIABLE_H

#include "sync/Mutex.hpp"
#include <pthread.h>

class ConditionVariable {
public:
    ConditionVariable();
    ~ConditionVariable();

    ConditionVariable(const ConditionVariable &) = delete;
    ConditionVariable &operator=(const ConditionVariable &) = delete;

    void wait(Mutex &mutex);
    void notifyOne();
    void notifyAll();

private:
    pthread_cond_t cond{};
};

#endif
