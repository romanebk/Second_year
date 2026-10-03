/*
** EPITECH PROJECT, 2026
** Paradigms Seminar
** File description:
** Day 09
*/

#pragma once

#include "IObject.hpp"

class List {
    public:
        class InvalidOperationException : public std::exception {
            public:
                const char* what() const noexcept override;
        };

    private:
        class Node {
            public:
                IObject *_obj;
                Node *_next;
                Node *_prev;
                Node(IObject *obj);
        };

    public:
        Node *_head;
        Node *_tail;
        std::size_t _size;

        List();
        ~List();

        bool empty() const;
        std::size_t size() const;

        IObject*& front();
        IObject* front() const;
        IObject*& back();
        IObject* back() const;

        void pushBack(IObject *obj);
        void pushFront(IObject *obj);
        void popBack();
        void popFront();
        void clear();
        void forEach(void(*function)(IObject *));
};