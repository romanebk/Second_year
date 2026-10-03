#include "Buffer.hpp"

void Buffer::append(const std::string& data) {
    _buf += data;
}

bool Buffer::hasLine() const {
    return _buf.find('\n') != std::string::npos;
}

std::string Buffer::getLine() {
    size_t pos = _buf.find('\n');
    if (pos == std::string::npos) {
        return "";
    }
    std::string line = _buf.substr(0, pos);
    _buf.erase(0, pos + 1);
    return line;
}