#include "PlazzaException.hpp"

PlazzaException::PlazzaException(const std::string &msg)
    : std::runtime_error(msg) {}

IpcException::IpcException(const std::string &msg)
    : PlazzaException(msg) {}

SyncException::SyncException(const std::string &msg)
    : PlazzaException(msg) {}

ProcessException::ProcessException(const std::string &msg)
    : PlazzaException(msg) {}

PizzaException::PizzaException(const std::string &msg)
    : PlazzaException(msg) {}
