#include "../FruitBox.hpp"
#include "../AFruit.hpp"
#include "../IFruit.hpp"
#include "../Orange.hpp"
#include <iostream>

// class TestFruit : public AFruit {
// public:
//     TestFruit(std::string const &name) : AFruit(name, 0) {
//         std::cout << name << " lives." << std::endl;
//     }
//     virtual ~TestFruit() {
//         std::cout << _name << " dies." << std::endl;
//     }
// };

int main(void)
{
    FruitBox box(3);
    const FruitBox& cref = box;

    box.pushFruit(new Orange());
    box.pushFruit(new Orange());
    box.pushFruit(new Orange());
    std::cout << cref << std::endl;

    IFruit* tmp = new Orange();

    std::cout << box.pushFruit(tmp) << std::endl;
    delete tmp;

    tmp = box.popFruit();
    delete tmp;
    std::cout << cref << std::endl;

    return 0;
}
