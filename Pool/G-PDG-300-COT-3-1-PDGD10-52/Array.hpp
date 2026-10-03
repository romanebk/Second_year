/*
** EPITECH PROJECT, 2025
** Array.hpp
** File description:
** Array
*/

#ifndef ARRAY_HPP
#define ARRAY_HPP

#include <iostream>
#include <ostream>
#include <string>
#include <algorithm>
#include <functional>

template <typename Type, std::size_t Size>

class Array {
    private:
        Type array[Size];
    public:
        Array() : array{} {}
        ~Array() = default;
        
        Type& operator[](std::size_t index)
        {
            if (index >= Size)
                throw std::out_of_range("Out of range");
            return array[index];
        }
        const Type& operator[](std::size_t index) const
        {
            if (index >= Size)
                throw std::out_of_range("Out of range");
            return array[index];
        }
        std::size_t size() const
        {
            return Size;
        }

        void forEach(const std::function<void(const Type&)>& task) const
        {
            for (std::size_t i = 0; i < Size; i++)
                task(array[i]);
        }

        template <typename U>
        Array<U, Size> convert(const std::function<U(const Type&)>& converter) const
        {
            Array<U, Size> newArray;
            for (std::size_t i = 0; i < Size; i++)
                newArray[i] = converter(array[i]);
            return newArray;
        }
};

template <typename Type, std::size_t Size>
std::ostream& operator<<(std::ostream& os, const Array<Type, Size>& array)
{
    os << "[";
    for (std::size_t i = 0; i < Size; i++) {
        os << array[i];
        if (i < Size - 1)
            os << ", ";
    }
    os << "]";
    return os;
}

#endif