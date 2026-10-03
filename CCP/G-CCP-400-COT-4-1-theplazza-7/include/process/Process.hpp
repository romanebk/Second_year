/*
** EPITECH PROJECT, 2026
** process
** File description:
** process
*/

#ifndef PROCESS_H
    #define PROCESS_H

#include <functional>
#include <sys/types.h>

class Process {
public:
    Process() = default;
    explicit Process(std::function<void()> routine);

    pid_t getPid() const;
    bool isChild() const;
    bool isParent() const;

    void wait() const;

private:
    pid_t _pid{-1};
    bool _isChild{false};
};

#endif
