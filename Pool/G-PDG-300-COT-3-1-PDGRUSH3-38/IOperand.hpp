/*
** EPITECH PROJECT, 2026
** IOperand.hpp
** File description:
** IOperand.hpp
*/

#pragma once

#include <string>
#include "OperandType.hpp"

class IOperand {
public:
    virtual ~IOperand() = default;

    virtual std::string toString() const = 0;
    virtual OperandType getType() const = 0;

    virtual IOperand* operator+(const IOperand& rhs) const = 0;
    virtual IOperand* operator-(const IOperand& rhs) const = 0;
    virtual IOperand* operator*(const IOperand& rhs) const = 0;
    virtual IOperand* operator/(const IOperand& rhs) const = 0;
    virtual IOperand* operator%(const IOperand& rhs) const = 0;
};
