/*
** EPITECH PROJECT, 2025
** Command.hpp
** File description:
** Command
*/

#ifndef COMMAND_HPP
#define COMMAND_HPP

#include <stack>
#include <map>
#include <iostream>
#include <string>
#include <algorithm>
#include <functional>
#include <stdexcept>

class Command {
    public:
        class Error : public std::exception {
            private:
                std::string _msg;
            public:
                Error(const std::string& msg);
                const char* what() const noexcept override;
        };

        Command();
        ~Command();
        void registerCommand(const std::string& name, const std::function<void()>& function);
        void executeCommand(const std::string& name);

    private:
        std::map<std::string, std::function<void()>> _commands;
};

#endif
