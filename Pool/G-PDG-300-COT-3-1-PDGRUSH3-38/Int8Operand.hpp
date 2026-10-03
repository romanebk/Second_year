/*
** EPITECH PROJECT, 2026
** Int8Operand.hpp
** File description:
** Int8Operand.hpp
*/

#pragma once

#include "IOperand.hpp"
#include "OperandType.hpp"
#include <string>
#include <cstdint>

class Int8Operand : public IOperand {
private:
    int8_t _value;
public:
    explicit Int8Operand(const std::string& value);
    ~Int8Operand() override = default;

    std::string toString() const override;
    OperandType getType() const override;

    IOperand* operator+(const IOperand& rhs) const override;
    IOperand* operator-(const IOperand& rhs) const override;
    IOperand* operator*(const IOperand& rhs) const override;
    IOperand* operator/(const IOperand& rhs) const override;
    IOperand* operator%(const IOperand& rhs) const override;
};
