/*
** EPITECH PROJECT, 2026
** stackCommand.hpp
** File description:
** stackCommand.hpp
*/

#ifndef STACKCOMMAND_HPP_
#define STACKCOMMAND_HPP_

#include <stack>
#include <string>
#include <iostream>
#include <vector>
#include "IOperand.hpp"

class Stack {
public:
    Stack();
    ~Stack();

    void push(IOperand* vPush);
    void pop();
    void clear();
    void swap();
    void display();
    void assert(IOperand *elem);
    void add();
    void sub();
    void mul();
    void div();
    void mod();
    void load();
    void store();
    void exit();

    bool hasExited() const;
    unsigned int StackC();

private:
    std::stack<IOperand*> _stack;
    bool _exited;
};

#endif
