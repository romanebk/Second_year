/*
** EPITECH PROJECT, 2026
** Int64Operand.hpp 
** File description:
** Int64Operand.hpp 
*/

#pragma once
#include "IOperand.hpp"
#include "OperandType.hpp"
#include <cstdint>
#include <string>

class Int64Operand : public IOperand {
private:
    int64_t _value;
public:
    explicit Int64Operand(const std::string &value);
    ~Int64Operand() override = default;

    std::string toString() const override;
    OperandType getType() const override;

    IOperand* operator+(const IOperand& rhs) const override;
    IOperand* operator-(const IOperand& rhs) const override;
    IOperand* operator*(const IOperand& rhs) const override;
    IOperand* operator/(const IOperand& rhs) const override;
    IOperand* operator%(const IOperand& rhs) const override;
};
