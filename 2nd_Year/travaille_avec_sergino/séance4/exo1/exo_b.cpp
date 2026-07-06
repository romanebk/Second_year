#include "exo.hpp"
#include <sstream>
#include <memory>

Data::Data(int v) : value(v) {}
Data::~Data()
{
    std::cout << "Data détruit" << std::endl;
}

int main () {
    std::unique_ptr<Data> d1 = std::make_unique<Data>(10);
    std::unique_ptr<Data> d2 = std::make_unique<Data>(20);
    std::cout << d1->getValue() << "\n";
    std::cout << d2->getValue() << "\n";
}

