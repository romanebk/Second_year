/*
** EPITECH PROJECT, 2026
** Int16Operand.hpp
** File description:
** Int16Operand.hpp
*/

#pragma once

#include "IOperand.hpp"
#include "OperandType.hpp"
#include <string>
#include <cstdint>

class Int16Operand : public IOperand {
private:
    int16_t _value;
public:
    explicit Int16Operand(const std::string& value);
    ~Int16Operand() override = default;

    std::string toString() const override;
    OperandType getType() const override;

    IOperand* operator+(const IOperand& rhs) const override;
    IOperand* operator-(const IOperand& rhs) const override;
    IOperand* operator*(const IOperand& rhs) const override;
    IOperand* operator/(const IOperand& rhs) const override;
    IOperand* operator%(const IOperand& rhs) const override;
};
