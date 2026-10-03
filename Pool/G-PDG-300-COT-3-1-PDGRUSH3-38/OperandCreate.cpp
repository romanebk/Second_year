/*
** EPITECH PROJECT, 2026
**  OperandCreate.cpp 
** File description:
**  OperandCreate.cpp 
*/

#include "OperandCreate.hpp"
#include "Int8Operand.hpp"
#include "Int16Operand.hpp"
#include "Int32Operand.hpp"
#include "Int64Operand.hpp"
#include "Float32Operand.hpp"
#include "Float64Operand.hpp"
#include "Exceptions.hpp"

IOperand* OperandFactory::createOperand(OperandType type, const std::string& value) {
    switch (type) {
    case Int8: return createInt8(value);
    case Int16: return createInt16(value);
    case Int32: return createInt32(value);
    case Int64: return createInt64(value);
    case Float32: return createFloat32(value);
    case Float64: return createFloat64(value);
    default: throw OperandException("Unknown operand type");
    }
}

IOperand* OperandFactory::createInt8(const std::string& value)
{
    return new Int8Operand(value);
}
IOperand* OperandFactory::createInt16(const std::string& value)
{
    return new Int16Operand(value);
}
IOperand* OperandFactory::createInt32(const std::string& value)
{
    return new Int32Operand(value);
}
IOperand* OperandFactory::createInt64(const std::string& value)
{
    return new Int64Operand(value);
}
IOperand* OperandFactory::createFloat32(const std::string& value)
{
    return new Float32Operand(value);
}
IOperand* OperandFactory::createFloat64(const std::string& value)
{
    return new Float64Operand(value);
}
