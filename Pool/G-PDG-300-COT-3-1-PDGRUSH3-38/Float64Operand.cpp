/*
** EPITECH PROJECT, 2026
** Float64Operand.cpp
*/

#include "Float64Operand.hpp"
#include "Exceptions.hpp"
#include "OperandCreate.hpp"
#include <limits>
#include <iostream>
#include <iomanip>
#include <cmath>

static long double convert(const IOperand& op) {
    return std::stold(op.toString());
}

Float64Operand::Float64Operand(const std::string& value) {
    long double v = std::stold(value);
    if (v < -std::numeric_limits<double>::max() || v > std::numeric_limits<double>::max())
        throw OperandException("Float64 overflow");
    _value = static_cast<double>(v);
}

OperandType Float64Operand::getType() const { return Float64; }

std::string Float64Operand::toString() const {
    std::stringstream ss;
    ss << std::fixed << std::setprecision(15) << _value;
    std::string s = ss.str();
    if (s.find('.') != std::string::npos) {
        s.erase(s.find_last_not_of('0') + 1, std::string::npos);
        if (s.back() == '.') s.pop_back();
    }
    return s;
}

IOperand* Float64Operand::operator+(const IOperand& rhs) const {
    long double res = _value + convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Float64Operand::operator-(const IOperand& rhs) const {
    long double res = _value - convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Float64Operand::operator*(const IOperand& rhs) const {
    long double res = _value * convert(rhs);
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Float64Operand::operator/(const IOperand& rhs) const {
    long double val = convert(rhs);
    if (val == 0) throw OperandException("Division by zero");
    long double res = _value / val;
    OperandType type = (this->getType() > rhs.getType()) ? this->getType() : rhs.getType();
    return OperandFactory::createOperand(type, std::to_string(res));
}

IOperand* Float64Operand::operator%(const IOperand& rhs) const {
    (void)rhs;
    throw OperandException("Modulo not supported for Float64");
}
