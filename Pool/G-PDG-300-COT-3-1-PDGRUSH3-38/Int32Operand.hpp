/*
** EPITECH PROJECT, 2026
** Int32Operand.hpp
** File description:
** Int32Operand.hpp
*/

#pragma once
#include <cstdint>
#include "IOperand.hpp"
#include "OperandType.hpp"
#include <string>

class Int32Operand : public IOperand {
private:
    int32_t _value;
public:
    explicit Int32Operand(const std::string &value);
    ~Int32Operand() override = default;

    std::string toString() const override;
    OperandType getType() const override;

    IOperand* operator+(const IOperand& rhs) const override;
    IOperand* operator-(const IOperand& rhs) const override;
    IOperand* operator*(const IOperand& rhs) const override;
    IOperand* operator/(const IOperand& rhs) const override;
    IOperand* operator%(const IOperand& rhs) const override;
};
