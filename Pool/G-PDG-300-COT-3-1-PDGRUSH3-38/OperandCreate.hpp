/*
** EPITECH PROJECT, 2026
** OperandCreate.hpp
** File description:
** OperandCreate.hpp
*/

#pragma once
#include "IOperand.hpp"

class OperandFactory {
public:
    static IOperand* createOperand(OperandType type, const std::string& value);
    ~OperandFactory() = default;

private:
    static IOperand* createInt8(const std::string& value);
    static IOperand* createInt16(const std::string& value);
    static IOperand* createInt32(const std::string& value);
    static IOperand* createInt64(const std::string& value);
    static IOperand* createFloat32(const std::string& value);
    static IOperand* createFloat64(const std::string& value);
};
