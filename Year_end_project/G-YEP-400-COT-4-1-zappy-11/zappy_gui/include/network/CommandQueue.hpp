#pragma once
#include <queue>
#include <string>
#include <mutex>




class CommandQueue {
public:
    void        push(const std::string &cmd);
    bool        pop(std::string &out);   
    bool        empty() const;

private:
    mutable std::mutex      _mutex;
    std::queue<std::string> _queue;
};