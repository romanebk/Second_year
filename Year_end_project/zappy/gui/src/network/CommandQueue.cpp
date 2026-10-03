#include "network/CommandQueue.hpp"

void CommandQueue::push(const std::string &cmd) {
    _queue.push(cmd);
}

std::string CommandQueue::pop() {
    std::string cmd = _queue.front();
    _queue.pop();
    return cmd;
}

bool CommandQueue::empty() const {
    return _queue.empty();
}