/*
** EPITECH PROJECT, 2026
** Int8Operand.cpp
*/

#include "Int8Operand.hpp"
#include "Exceptions.hpp"
#include "OperandCreate.hpp"
#include <limits>
#include <iostream>
#include <cmath>

static long double convert(const IOperand& op) {
    return std::stold(op.toString());
}

Int8Operand::Int8Operand(const std::string& value) {
    long double v = std::stold(value);
    if (v < std::numeric_limits<int8_t>::min() || v > std::numeric_limits<int8_t>::max())
        throw OperandException("Int8 overflow");
    _value = static_cast<int8_t>(v);
}

OperandType Int8Operand::getType() const { return Int8; }
std::string Int8Operand::toString() const { return std::to_string(_value); }

IOperand* Int8Operand::operator+(const IOperand& rhs) const {
    long double res = _value + convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Int8Operand::operator-(const IOperand& rhs) const {
    long double res = _value - convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Int8Operand::operator*(const IOperand& rhs) const {
    long double res = _value * convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Int8Operand::operator/(const IOperand& rhs) const {
    long double val = convert(rhs);
    if (val == 0) throw OperandException("Division by zero");
    long double res = _value / val;
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Int8Operand::operator%(const IOperand& rhs) const {
    long double val = convert(rhs);
    if (val == 0) throw OperandException("Modulo by zero");
    long double res = std::fmod((long double)_value, val);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}
