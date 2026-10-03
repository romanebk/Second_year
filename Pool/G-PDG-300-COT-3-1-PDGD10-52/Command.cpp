#include "Command.hpp"
#include "Stack.hpp"

Command::Command() {}

Command::~Command() {}

Command::Error::Error(const std::string& msg) : _msg(msg) {}

const char* Command::Error::what() const noexcept
{
    return _msg.c_str();
}

void Command::registerCommand(const std::string& name, const std::function<void()>& function)
{
    auto iterateur = _commands.find(name);
    if (iterateur != _commands.end()) {
        throw Error("Already registered command");
    }
    _commands[name] = function;
}

void Command::executeCommand(const std::string& name)
{
    auto iterateur = _commands.find(name);
    if (iterateur == _commands.end()) {
        throw Error("Unknow command");
    }
    iterateur->second();
}
