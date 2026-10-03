/*
** EPITECH PROJECT, 2026
** Int16Operand.cpp
*/

#include "Int16Operand.hpp"
#include "Exceptions.hpp"
#include "OperandCreate.hpp"
#include <limits>
#include <iostream>
#include <cmath>

static long double convert(const IOperand& op) {
    return std::stold(op.toString());
}

Int16Operand::Int16Operand(const std::string& value) {
    long double v = std::stold(value);
    if (v < std::numeric_limits<int16_t>::min() || v > std::numeric_limits<int16_t>::max())
        throw OperandException("Int16 overflow");
    _value = static_cast<int16_t>(v);
}

OperandType Int16Operand::getType() const { return Int16; }
std::string Int16Operand::toString() const { return std::to_string(_value); }

IOperand* Int16Operand::operator+(const IOperand& rhs) const {
    long double res = _value + convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Int16Operand::operator-(const IOperand& rhs) const {
    long double res = _value - convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Int16Operand::operator*(const IOperand& rhs) const {
    long double res = _value * convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Int16Operand::operator/(const IOperand& rhs) const {
    long double val = convert(rhs);
    if (val == 0) throw OperandException("Division by zero");
    long double res = _value / val;
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Int16Operand::operator%(const IOperand& rhs) const {
    long double val = convert(rhs);
    if (val == 0) throw OperandException("Modulo by zero");
    long double res = std::fmod((long double)_value, val);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}
