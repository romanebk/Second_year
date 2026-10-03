/*
** EPITECH PROJECT, 2025
** Stack.cpp
** File description:
** Stack
*/

#include "Stack.hpp"

Stack::Stack() {}

Stack::~Stack() {}

void Stack::push(double value)
{
    _stack.push(value);
}

void Stack::pop()
{
    if (_stack.empty())
        throw Error("Empty stack");
    _stack.pop();
}

double Stack::top() const
{
    if (_stack.empty())
        throw Error("Empty stack");
    return _stack.top();
}

void Stack::add()
{
    if (_stack.size() < 2)
        throw Error("Not enough operands");
    double a = _stack.top();
    _stack.pop();
    double b = _stack.top();
    _stack.pop();
    _stack.push(a + b);
}

void Stack::sub()
{
    if (_stack.size() < 2)
        throw Error("Not enough operands");
    double a = _stack.top();
    _stack.pop();
    double b = _stack.top();
    _stack.pop();
    _stack.push(a - b);
}

void Stack::mul()
{
    if (_stack.size() < 2)
        throw Error("Not enough operands");
    double a = _stack.top();
    _stack.pop();
    double b = _stack.top();
    _stack.pop();
    _stack.push(a * b);
}

void Stack::div()
{
    if (_stack.size() < 2)
        throw Error("Not enough operands");
    double a = _stack.top();
    _stack.pop();
    double b = _stack.top();
    _stack.pop();
    if (b == 0)
        throw Error("");
    _stack.push(a / b);
}

Stack::Error::Error(const std::string& message) : _message(message) {}

const char* Stack::Error::what() const noexcept
{
    return _message.c_str();
}

