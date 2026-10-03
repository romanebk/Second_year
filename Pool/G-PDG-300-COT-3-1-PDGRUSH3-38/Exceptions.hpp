/*
** EPITECH PROJECT, 2026
** Exceptions.hpp
** File description:
** Exceptions.hpp
*/

#pragma once

#include <exception>
#include <string>

class OperandException : public std::exception {
private:
    std::string _msg;

public:
    explicit OperandException(const std::string& msg);
    const char* what() const noexcept override;
};
