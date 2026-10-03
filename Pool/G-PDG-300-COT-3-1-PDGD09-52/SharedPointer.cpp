/*
** EPITECH PROJECT, 2026
** Paradigms Seminar
** File description:
** Day 09
*/

#include "SharedPointer.hpp"

SharedPointer::SharedPointer(IObject *ptr) : _ptr(ptr)
{
    _ref_count = 1;
}

SharedPointer::SharedPointer(const SharedPointer &other_obj) : _ptr(other_obj._ptr)
{
    _ref_count = other_obj._ref_count;
    ++(*_ref_count);
}

SharedPointer &SharedPointer::operator=(const SharedPointer &other_obj)
{
    if (this != &other_obj) {
        reset();
        _ptr = other_obj._ptr;
        _ref_count = other_obj._ref_count;
        ++(*_ref_count);
    }
    return *this;
}

