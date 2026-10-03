/*
** EPITECH PROJECT, 2026
** process
** File description:
** process
*/

#include "process/Process.hpp"
#include "PlazzaException.hpp"

#include <sys/wait.h>
#include <unistd.h>

Process::Process(std::function<void()> routine)
{
    _pid = ::fork();
    if (_pid < 0)
        throw ProcessException("fork failed");
    if (_pid == 0) {
        _isChild = true;
        if (routine)
            routine();
        ::_exit(0);
    }
}

pid_t Process::getPid() const { return _pid; }

bool Process::isChild() const { return _isChild; }

bool Process::isParent() const { return !_isChild && _pid > 0; }

void Process::wait() const
{
    if (_pid <= 0 || _isChild)
        return;
    int status = 0;
    if (::waitpid(_pid, &status, 0) < 0)
        throw ProcessException("waitpid failed");
}