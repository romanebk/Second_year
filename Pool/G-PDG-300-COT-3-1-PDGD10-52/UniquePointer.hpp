/*
** EPITECH PROJECT, 2025
** UniquePointer.hpp
** File description:
** UniquePointer
*/

#ifndef UNIQUEPOINTER_HPP
#define UNIQUEPOINTER_HPP

#include <stack>
#include <iostream>
#include <string>
#include <algorithm>
#include <functional>


template <typename Type>
class UniquePointer {
private:
    Type* _ptr;

public:
    UniquePointer() : _ptr(nullptr) {}
    
    UniquePointer(Type* ptr) : _ptr(ptr) {}

    ~UniquePointer()
    {
        delete _ptr;
    }
    UniquePointer &operator=(Type *ptr)
    {
        delete _ptr;
        _ptr = ptr;
        return *this;
    }

    Type* get()
    {
        return _ptr;
    }
    Type* operator->()
    {
        return _ptr;
    }
    Type& operator*()
    {
        return *_ptr;
    }
    void reset(Type* ptr = nullptr)
    {
        delete _ptr;
        _ptr = ptr;
    }
};

#endif


