#include <string>
#include <iostream>
#include <vector>
#include <string>
#include <sstream>

#ifndef EXO_HPP
#define EXO_HPP

template<typename T>
T minimum(T a, T b)
{
    if (a < b) {
        return a;
    }
    return b;
}

#endif

