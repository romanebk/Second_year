#include <string>
#include <iostream>
#include <vector>
#include <string>
#include <sstream>

#ifndef SERIALIZABLE_HPP
#define SERIALIZABLE_HPP

class ISerializable {
    public:
        virtual ~ISerializable();
        virtual std::string serialize() = 0;
        virtual void deserialize(std::string to_deserialize) = 0;
};

class Point : public ISerializable {
    public:
        int x;
        int y;

        Point(int _x, int _y);
        ~Point();
        std::string serialize() override;
        void deserialize(std::string to_deserialize) override;
};

#endif

