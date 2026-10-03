/*
** EPITECH PROJECT, 2026
** Paradigms Seminar
** File description:
** Day 09
*/

#include "UniquePointer.hpp"

UniquePointer::UniquePointer(IObject *ptr) : _ptr(ptr) {}

UniquePointer::UniquePointer(UniquePointer &&other_obj) : _ptr(other_obj._ptr)
{
    other_obj._ptr = nullptr;
}

UniquePointer &UniquePointer::operator=(UniquePointer &&other_obj)
{
    if (this != &other_obj) {
        delete _ptr;
        _ptr = other_obj._ptr;
        other_obj._ptr = nullptr;
    }
    return *this;
}

UniquePointer &UniquePointer::operator=(IObject *ptr)
{
    delete _ptr;
    _ptr = ptr;
    return *this;
}

UniquePointer::~UniquePointer()
{
    delete _ptr;
}

IObject &UniquePointer::operator*() const
{
    return *_ptr;
}

IObject *UniquePointer::operator->() const
{
    return _ptr;
}

void UniquePointer::reset(IObject *ptr)
{
    delete _ptr;
    _ptr = ptr;
}

void UniquePointer::swap(UniquePointer &other_obj)
{
    IObject *tmp = _ptr;
    _ptr = other_obj._ptr;
    other_obj._ptr = tmp;
}

void UniquePointer::touch()
{
    if (_ptr)
        _ptr->touch();
}

