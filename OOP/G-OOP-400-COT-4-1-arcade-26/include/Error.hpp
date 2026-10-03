
#ifndef ERROR_HPP
#define ERROR_HPP

#include <exception>
#include <string>
class Error : public std::exception {
public:
    Error(const std::string &message) : _message(message) {}
    const char *what() const noexcept override { return _message.c_str(); }
private:
    std::string _message;
};

#endif