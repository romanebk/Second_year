/*
** EPITECH PROJECT, 2026
**  Float64Operand.hpp  
** File description:
**  Float64Operand.hpp  
*/

#pragma once

#include "IOperand.hpp"
#include "OperandType.hpp"
#include <cstdint>
#include <string>

class Float64Operand : public IOperand {
private:
    double _value;
public:
    explicit Float64Operand(const std::string& value);
    ~Float64Operand() override = default;

    std::string toString() const override;
    OperandType getType() const override;

    IOperand* operator+(const IOperand& rhs) const override;
    IOperand* operator-(const IOperand& rhs) const override;
    IOperand* operator*(const IOperand& rhs) const override;
    IOperand* operator/(const IOperand& rhs) const override;
    IOperand* operator%(const IOperand& rhs) const override;
};
