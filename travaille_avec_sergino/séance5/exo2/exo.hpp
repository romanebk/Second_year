#include <string>
#include <iostream>
#include <stack>

#ifndef EXO_HPP
#define EXO_HPP

template<typename T>
class Stack {
    public:
        Stack();
        ~Stack();
        void push(T value);
        T pop();
        T top();
        bool empty();
        int size();
    private:
        std::stack<T> elem;
};
#endif

