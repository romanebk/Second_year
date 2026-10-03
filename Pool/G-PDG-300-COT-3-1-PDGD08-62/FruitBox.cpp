/*
** EPITECH PROJECT, 2026
** pool
** File description:
** FruitBox.cpp
*/

#include "FruitBox.hpp"

FruitBox::FruitBox(unsigned int size) : _size(size) {}

FruitBox::~FruitBox() 
{
    for (IFruit *fruit : _fruits)
        delete fruit;
    _fruits.clear();
}

unsigned int FruitBox::getSize() const 
{
    return _size;
}

unsigned int FruitBox::nbFruits() const 
{
    return _fruits.size();
}

bool FruitBox::pushFruit(IFruit *fruit) 
{
    if (_fruits.size() >= _size)
        return false;
    if (std::find(_fruits.begin(), _fruits.end(), fruit) != _fruits.end())
        return false;
    _fruits.push_back(fruit);
    return true;
}

IFruit *FruitBox::popFruit() 
{
    if (_fruits.empty())
        return nullptr;
    IFruit *fruit = _fruits.front();
    _fruits.pop_front();
    return fruit;
}

const std::list<IFruit*> &FruitBox::getFruits() const
{
    return _fruits;
}

std::ostream& operator<<(std::ostream& os, const FruitBox& box)
{
    std::string result = "[";
    bool first = true;
    
    for (IFruit* fruit : box.getFruits()) {
        if (!first) {
            result += ", ";
        }
        result += "{ \"name\": \"" + fruit->getName() + "\", \"vitamins\": " + std::to_string(fruit->getVitamins()) + ", \"peeled\": " + (fruit->isPeeled() ? "true" : "false") + " }";
        first = false;
    }
    result += "]";
    os << result;
    return os;
}
