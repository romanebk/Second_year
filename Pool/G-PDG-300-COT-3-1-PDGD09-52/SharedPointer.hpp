/*
** EPITECH PROJECT, 2026
** Paradigms Seminar
** File description:
** Day 09
*/

#pragma once

#include "IObject.hpp"

class SharedPointer : public IObject {
    public:
        SharedPointer() = default;
        SharedPointer(IObject *ptr);
        SharedPointer(const SharedPointer &other_obj);
        SharedPointer &operator=(const SharedPointer &other_obj);
        SharedPointer(SharedPointer &&other_obj);
        SharedPointer &operator=(SharedPointer &&other_obj);
        ~SharedPointer() override;

        IObject &operator*() const;
        IObject *operator->() const;
        
        void reset(IObject *ptr = nullptr);
        void swap(SharedPointer &other_obj);
        void touch() override;
    private:
        IObject *_ptr = nullptr;
        size_t *_ref_count = nullptr;
};