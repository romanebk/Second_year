/*
** EPITECH PROJECT, 2026
** Paradigms Seminar
** File description:
** Day 09
*/

#pragma once

#include "IObject.hpp"

class UniquePointer : public IObject {
    public:
        UniquePointer() = default;
        UniquePointer(IObject *ptr);
        UniquePointer(const UniquePointer &other_obj) = delete;
        UniquePointer &operator=(const UniquePointer &other_obj) = delete;
        UniquePointer(UniquePointer &&other_obj);
        UniquePointer &operator=(UniquePointer &&other_obj);
        UniquePointer &operator=(IObject *ptr);
        ~UniquePointer() override;
        IObject &operator*() const;
        IObject *operator->() const;
        void reset(IObject *ptr = nullptr);
        void swap(UniquePointer &other_obj);
        void touch() override;
    private:
        IObject *_ptr = nullptr;
};