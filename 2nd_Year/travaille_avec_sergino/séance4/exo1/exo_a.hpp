#include <string>
#include <iostream>
#include <vector>
#include <string>
#include <sstream>

#ifndef DATA_HPP
#define DATA_HPP

class Data {
    int value;
public :
    Data(int v);
    ~Data();
    int getValue() const {
        return value;
    }
};

#endif

