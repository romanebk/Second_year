/*
** EPITECH PROJECT, 2025
** Stack.hpp
** File description:
** Stack
*/

#ifndef STACK_HPP
#define STACK_HPP

#include <stack>
#include <iostream>
#include <string>
#include <algorithm>
#include <functional>

class Stack {
    public:
        Stack();
        ~Stack();
        void push(double value);
        void pop();
        double top() const;
        void add();
        void sub();
        void mul();
        void div();

        class Error : public std::exception {
            public:
                Error(const std::string& message);
                const char* what() const noexcept override;
            private:
                std::string _message;
        };
    private:
        std::stack<double> _stack;
};

#endif