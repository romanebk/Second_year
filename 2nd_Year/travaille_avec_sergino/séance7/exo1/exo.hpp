#ifndef INTARRAY_HPP
#define INTARRAY_HPP

#include <iostream>
#include <cstddef>

class IntArray
{
private:
    int* data;
    size_t size;

public:
    IntArray(size_t n = 0);
    IntArray(const IntArray& other);
    IntArray(IntArray&& other) noexcept;
    IntArray& operator=(const IntArray& other);
    IntArray& operator=(IntArray&& other) noexcept;
    ~IntArray();

    int& operator[](size_t index);
    const int& operator[](size_t index) const;
    size_t getSize() const;
};

#endif
