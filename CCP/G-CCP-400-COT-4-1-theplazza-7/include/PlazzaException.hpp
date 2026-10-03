#ifndef PLAZZA_EXCEPTION_H
    #define PLAZZA_EXCEPTION_H

#include <stdexcept>
#include <string>

class PlazzaException : public std::runtime_error {
public:
    explicit PlazzaException(const std::string &msg);
};

class IpcException : public PlazzaException {
public:
    explicit IpcException(const std::string &msg);
};

class SyncException : public PlazzaException {
public:
    explicit SyncException(const std::string &msg);
};

class ProcessException : public PlazzaException {
public:
    explicit ProcessException(const std::string &msg);
};

class PizzaException : public PlazzaException {
public:
    explicit PizzaException(const std::string &msg);
};

#endif
