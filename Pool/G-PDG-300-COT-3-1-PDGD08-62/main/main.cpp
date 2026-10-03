#include <iostream>
#include "../FruitUtils.hpp"
#include "../Lemon.hpp"
#include "../Orange.hpp"
#include "../Strawberry.hpp"
#include "../Raspberry.hpp"
#include "../Almond.hpp"
#include "../FruitBox.hpp"

int main()
{
    std::cout << "=== Test pack & unpack ===" << std::endl;

    // Create a null-terminated array of 5 fruits
    IFruit** fruits = new IFruit*[6];
    fruits[0] = new Lemon();
    fruits[1] = new Orange();
    fruits[2] = new Strawberry();
    fruits[3] = new Raspberry();
    fruits[4] = new Almond();
    fruits[5] = nullptr;

    // Display fruits before packing
    std::cout << "\n-- Fruits before packing --" << std::endl;
    for (unsigned int i = 0; fruits[i] != nullptr; i++) {
        std::cout << *fruits[i] << std::endl;
    }

    // Pack into boxes of size 2
    std::cout << "\n-- Packing into boxes of size 2 --" << std::endl;
    FruitBox** boxes = FruitUtils::pack(fruits, 2);

    unsigned int boxIndex = 0;
    while (boxes[boxIndex] != nullptr) {
        std::cout << "Box " << boxIndex << ": " << *boxes[boxIndex] << std::endl;
        boxIndex++;
    }
    std::cout << "Total boxes: " << boxIndex << std::endl;

    // Unpack all fruits from boxes
    // std::cout << "\n-- Unpacking all boxes --" << std::endl;
    // IFruit** unpacked = FruitUtils::unpack(boxes);

    // for (unsigned int i = 0; unpacked[i] != nullptr; i++) {
    //     std::cout << *unpacked[i] << std::endl;
    // }

    // // Cleanup
    // for (unsigned int i = 0; unpacked[i] != nullptr; i++) {
    //     delete unpacked[i];
    // }
    // delete[] unpacked;

    // for (unsigned int i = 0; boxes[i] != nullptr; i++) {
    //     delete boxes[i];
    // }
    // delete[] boxes;
    // delete[] fruits; // fruits themselves were moved into boxes then unpacked

    return 0;
}
