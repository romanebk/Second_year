/*
** EPITECH PROJECT, 2026
** Float32Operand.hpp
** File description:
** Float32Operand.hpp
*/

#pragma once

#include "IOperand.hpp"
#include "OperandType.hpp"
#include <cstdint>
#include <string>

class Float32Operand : public IOperand {
private:
    float _value;
public:
    explicit Float32Operand(const std::string& value);
    ~Float32Operand() override = default;

    std::string toString() const override;
    OperandType getType() const override;

    IOperand* operator+(const IOperand& rhs) const override;
    IOperand* operator-(const IOperand& rhs) const override;
    IOperand* operator*(const IOperand& rhs) const override;
    IOperand* operator/(const IOperand& rhs) const override;
    IOperand* operator%(const IOperand& rhs) const override;
};
