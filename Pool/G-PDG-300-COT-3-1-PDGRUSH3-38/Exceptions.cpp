/*
** EPITECH PROJECT, 2026
** Exceptions.cpp
** File description:
** Exceptions.cpp
*/

#include "Exceptions.hpp"

OperandException::OperandException(const std::string& msg) : _msg(msg)
{
}
const char* OperandException::what() const noexcept {
    return _msg.c_str();
}
