#pragma once
#include <queue>
#include <string>

class CommandQueue {
public:
    void        push(const std::string &cmd);
    std::string pop();
    bool        empty() const;

private:
    std::queue<std::string> _queue;
};