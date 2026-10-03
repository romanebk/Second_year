/*
** EPITECH PROJECT, 2026
** Float32Operand.cpp
*/

#include "Float32Operand.hpp"
#include "Exceptions.hpp"
#include "OperandCreate.hpp"
#include <limits>
#include <iostream>
#include <iomanip>
#include <cmath>

static long double convert(const IOperand& op) {
    return std::stold(op.toString());
}

Float32Operand::Float32Operand(const std::string& value) {
    long double v = std::stold(value);
    if (v < -std::numeric_limits<float>::max() || v > std::numeric_limits<float>::max())
        throw OperandException("Float32 overflow");
    _value = static_cast<float>(v);
}

OperandType Float32Operand::getType() const { return Float32; }

std::string Float32Operand::toString() const {
    std::stringstream ss;
    ss << std::fixed << std::setprecision(7) << _value;
    std::string s = ss.str();
    if (s.find('.') != std::string::npos) {
        s.erase(s.find_last_not_of('0') + 1, std::string::npos);
        if (s.back() == '.') s.pop_back();
    }
    return s;
}

IOperand* Float32Operand::operator+(const IOperand& rhs) const {
    long double res = _value + convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Float32Operand::operator-(const IOperand& rhs) const {
    long double res = _value - convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Float32Operand::operator*(const IOperand& rhs) const {
    long double res = _value * convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Float32Operand::operator/(const IOperand& rhs) const {
    long double val = convert(rhs);
    if (val == 0) throw OperandException("Division by zero");
    long double res = _value / val;
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Float32Operand::operator%(const IOperand& rhs) const {
    (void)rhs;
    throw OperandException("Modulo not supported for Float32");
}
