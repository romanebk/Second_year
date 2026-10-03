/*
** EPITECH PROJECT, 2026
** Error.cpp
** File description:
** Exception handling implementation for nanotekspice
*/

#include "Error.hpp"

nts::handle_Error::handle_Error(const std::string& message) : _message(message) {}

const char* nts::handle_Error::what() const noexcept {
    return _message.c_str();
}
