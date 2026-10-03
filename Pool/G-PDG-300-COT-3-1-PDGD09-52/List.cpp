/*
** EPITECH PROJECT, 2026
** Paradigms Seminar
** File description:
** Day 09
*/

#include "List.hpp"

List::List() : _head(nullptr), _tail(nullptr), _size(0) {}

List::~List()
{
    clear();
}

List::Node::Node(IObject *obj) : _obj(obj), _next(nullptr), _prev(nullptr) {}

const char* List::InvalidOperationException::what() const noexcept
{
    return "Invalid operation on List";
}

bool List::empty() const
{
    if (_size == 0)
        return true;
    return false;
}

std::size_t List::size() const
{
    return _size;
}

IObject*& List::front()
{
    if (empty() == true)
        throw InvalidOperationException();
    return _head->_obj;
}

IObject* List::front() const
{
    if (empty() == true)
        throw InvalidOperationException();
    return _head->_obj;
}

IObject*& List::back()
{
    if (empty() == true)
        throw InvalidOperationException();
    return _tail->_obj;
}

IObject* List::back() const
{
    if (empty() == true)
        throw InvalidOperationException();
    return _tail->_obj;
}

void List::clear()
{
    while (_head != nullptr) {
        Node *tmp = _head;
        _head = _head->_next;
        delete tmp->_obj;
        delete tmp;
    }
    _head = nullptr;
    _tail = nullptr;
    _size = 0;
}

void List::pushBack(IObject* obj)
{
    Node *newNode = new Node(obj);
    if (empty()) {
        _head = newNode;
        _tail = newNode;
    } else {
        _tail->_next = newNode;
        newNode->_prev = _tail;
        _tail = newNode;
    }
    _size++;
}

void List::pushFront(IObject* obj)
{
    Node *newNode = new Node(obj);
    if (empty() == true) {
        _head = newNode;
        _tail = newNode;
    } else {
        newNode->_next = _head;
        _head->_prev = newNode;
        _head = newNode;
    }
    _size++;
}

void List::popBack()
{
    if (empty() == true)
        throw InvalidOperationException();
    
    Node *tmp = _tail;
    if (_head == _tail) {
        _head = nullptr;
        _tail = nullptr;
    } else {
        _tail = _tail->_prev;
        _tail->_next = nullptr;
    }
    delete tmp->_obj;
    delete tmp;
    _size--;
}

void List::popFront()
{
    if (empty() == true)
        throw InvalidOperationException();
    
    Node *tmp = _head;
    if (_head == _tail) {
        _head = nullptr;
        _tail = nullptr;
    } else {
        _head = _head->_next;
        _head->_prev = nullptr;
    }
    delete tmp->_obj;
    delete tmp;
    _size--;
}

void List::forEach(void(*function)(IObject*))
{
    Node *curr = _head;
    while (curr) {
        function(curr->_obj);
        curr = curr->_next;
    }
}

void touch(IObject* object)
{
    if (object != nullptr)
        object->touch();
}
