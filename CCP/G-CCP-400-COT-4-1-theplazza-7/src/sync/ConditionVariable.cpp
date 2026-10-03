/*
** EPITECH PROJECT, 2026
** conditionvariable
** File description:
** conditionvariable
*/

#include "sync/ConditionVariable.hpp"
#include "PlazzaException.hpp"

ConditionVariable::ConditionVariable()
{
    if (pthread_cond_init(&cond, nullptr) != 0)
        throw SyncException("pthread_cond_init failed");
}

ConditionVariable::~ConditionVariable()
{
    pthread_cond_destroy(&cond);
}

void ConditionVariable::wait(Mutex &mutex)
{
    pthread_cond_wait(&cond, mutex.nativeHandle());
}

void ConditionVariable::notifyOne()
{
    pthread_cond_signal(&cond);
}

void ConditionVariable::notifyAll()
{
    pthread_cond_broadcast(&cond);
}
