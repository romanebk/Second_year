/*
** EPITECH PROJECT, 2026
** stackCommand.cpp
** File description:
** stackCommand.cpp
*/

#include "stackCommand.hpp"
#include <stdexcept>
#include <iostream>
#include <cstring>

Stack::Stack() : _exited(false)
{
}

Stack::~Stack()
{
    while (!_stack.empty()) {
        delete _stack.top();
        _stack.pop();
    }
}

void Stack::pop()
{
    if (_stack.empty())
        throw std::runtime_error("Empty stack");
    delete _stack.top();
    _stack.pop();
}

void Stack::push(IOperand* vPush)
{
    _stack.push(vPush);
}

void Stack::clear()
{
    while (!_stack.empty()) {
        delete _stack.top();
        _stack.pop();
    }
}

void Stack::swap()
{
    if (_stack.size() < 2)
        throw std::runtime_error("Stack size < 2");
    IOperand* a = _stack.top();
    _stack.pop();
    IOperand* b = _stack.top();
    _stack.pop();

    _stack.push(a);
    _stack.push(b);
}

void Stack::display()
{
    if (_stack.empty())
        throw std::runtime_error("Empty stack");
    std::cout << _stack.top()->toString() << std::endl;
}

void Stack::assert(IOperand *elem)
{
    if (_stack.empty())
        throw std::runtime_error("Empty stack");
    if (_stack.top()->getType() != elem->getType() || _stack.top()->toString() != elem->toString())
        throw std::runtime_error("Assert failed");
}

void Stack::add()
{
    if (_stack.size() < 2)
        throw std::runtime_error("Stack size < 2");
    IOperand* v1 = _stack.top(); _stack.pop();
    IOperand* v2 = _stack.top(); _stack.pop();
    try {
        _stack.push(*v2 + *v1);
        delete v1; delete v2;
    } catch (...) { _stack.push(v2); _stack.push(v1); throw; }
}

void Stack::sub()
{
    if (_stack.size() < 2)
        throw std::runtime_error("Stack size < 2");
    IOperand* v1 = _stack.top(); _stack.pop();
    IOperand* v2 = _stack.top(); _stack.pop();
    try {
        _stack.push(*v2 - *v1);
        delete v1; delete v2;
    } catch (...) { _stack.push(v2); _stack.push(v1); throw; }
}

void Stack::mul()
{
    if (_stack.size() < 2)
        throw std::runtime_error("Stack size < 2");
    IOperand* v1 = _stack.top(); _stack.pop();
    IOperand* v2 = _stack.top(); _stack.pop();
    try {
        _stack.push(*v2 * *v1);
        delete v1; delete v2;
    } catch (...) { _stack.push(v2); _stack.push(v1); throw; }
}

void Stack::div()
{
    if (_stack.size() < 2)
        throw std::runtime_error("Stack size < 2");
    IOperand* v1 = _stack.top(); _stack.pop();
    IOperand* v2 = _stack.top(); _stack.pop();
    try {
        _stack.push(*v2 / *v1);
        delete v1; delete v2;
    } catch (...) { _stack.push(v2); _stack.push(v1); throw; }
}

void Stack::mod()
{
    if (_stack.size() < 2)
        throw std::runtime_error("Stack size < 2");
    IOperand* v1 = _stack.top(); _stack.pop();
    IOperand* v2 = _stack.top(); _stack.pop();
    try {
        _stack.push(*v2 % *v1);
        delete v1; delete v2;
    } catch (...) { _stack.push(v2); _stack.push(v1); throw; }
}

void Stack::load() {}
void Stack::store() {}

void Stack::exit()
{
    _exited = true;
}

bool Stack::hasExited() const
{
    return _exited;
}

unsigned int Stack::StackC()
{
    return 0;
}

int main(int ac, char **av)
{
    if (ac == 2 && (strcmp(av[1], "--help") == 0 || strcmp(av[1], "-h") == 0)) {
        std::cout << "usage: bistroMatic [options]\n";
        std::cout << "options:\n";
        std::cout << "-h, --help Show this help\n";
        std::cout << "-b, --bonus Add any flag you want for bonuses!\n";
    } else if (ac != 1 && ac != 2) {
        return 84;
    }
    return 0;
}
