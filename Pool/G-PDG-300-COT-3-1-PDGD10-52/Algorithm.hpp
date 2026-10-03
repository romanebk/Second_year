/*
** EPITECH PROJECT, 2025
** Algorithm.hpp
** File description:
** Algorithm
*/

#ifndef ALGORITHM_HPP
#define ALGORITHM_HPP

#include <iostream>
#include <ostream>
#include <string>
#include <algorithm>

template <typename T>
void swap(T& a, T& b)
{
    T tmp = a;
    a = b;
    b = tmp;
}

template <typename T>
T min(const T& a, const T& b)
{
    if (a < b)
        return a;
    return b;
}

template <typename T>
T max(const T& a, const T& b)
{
    if (a < b)
        return b;
    return a;
}

template <typename T>
T clamp(const T& value, const T& min, const T& max)
{
    if (value < min)
        return min;
    if (max < value)
        return max;
    return value;
}

template <typename T>
class Algorithm {
    public:
        Algorithm() = default;
        ~Algorithm() = default;
        void swap(T& a, T& b)
        {
            T tmp = a;
            a = b;
            b = tmp;
        }
        T min(const T& a, const T& b)
        {
            if (a < b)
                return a;
            return b;
        }
        T max(const T& a, const T& b)
        {
            if (a < b)
                return b;
            return a;
        }
        T clamp(const T& value, const T& min, const T& max)
        {
            if (value < min)
                return min;
            if (max < value)
                return max;
            return value;
        }
};

#endif
