#include "CommandQueue.hpp"

void CommandQueue::push(const std::string &cmd) {
    std::lock_guard<std::mutex> lock(_mutex);
    _queue.push(cmd);
}

bool CommandQueue::pop(std::string &out) {
    std::lock_guard<std::mutex> lock(_mutex);
    if (_queue.empty())
        return false;
    out = std::move(_queue.front());
    _queue.pop();
    return true;
}

bool CommandQueue::empty() const {
    std::lock_guard<std::mutex> lock(_mutex);
    return _queue.empty();
}
