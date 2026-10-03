#include "../FruitBox.hpp"
#include "../FruitUtils.hpp"
#include "../Lemon.hpp"
#include "../Orange.hpp"
#include "../Grapefruit.hpp"
#include "../BloodOrange.hpp"
#include "../Strawberry.hpp"
#include "../Raspberry.hpp"
#include "../Almond.hpp"
#include "../Coconut.hpp"
#include "../AFruit.hpp"
#include <iostream>

class Lime : public AFruit {
public:
    Lime() : AFruit("lime", 0) {}
    ~Lime() {}
};

class Alien : public AFruit {
public:
    Alien() : AFruit("alien", 42) {
        _peeled = true;
    }
    ~Alien() {}
};

int main()
{
    FruitBox unsorted(10);
    FruitBox lemon(1);
    FruitBox citrus(1);
    FruitBox berry(1);

    unsorted.pushFruit(new Lemon());           // Lemon
    unsorted.pushFruit(new Orange());          // Citrus
    unsorted.pushFruit(new Grapefruit());      // Citrus (will stay in unsorted because citrus box full)
    unsorted.pushFruit(new BloodOrange());     // Citrus (will stay in unsorted because citrus box full)
    
    Strawberry* s = new Strawberry();
    s->peel();
    unsorted.pushFruit(s);                     // Berry

    Raspberry* r = new Raspberry();
    r->peel();
    unsorted.pushFruit(r);                     // Berry (will stay in unsorted because berry box full)

    unsorted.pushFruit(new Almond());          // Not sorted
    unsorted.pushFruit(new Coconut());         // Not sorted
    unsorted.pushFruit(new Lime());            // Not sorted
    unsorted.pushFruit(new Alien());           // Not sorted

    std::cout << "Before sort:" << std::endl;
    std::cout << "unsorted: " << unsorted << std::endl;
    std::cout << "lemon: " << lemon << std::endl;
    std::cout << "citrus: " << citrus << std::endl;
    std::cout << "berry: " << berry << std::endl;
    std::cout << std::endl;

    FruitUtils::sort(unsorted, lemon, citrus, berry);

    std::cout << "After sort:" << std::endl;
    std::cout << "unsorted: " << unsorted << std::endl;
    std::cout << "lemon: " << lemon << std::endl;
    std::cout << "citrus: " << citrus << std::endl;
    std::cout << "berry: " << berry << std::endl;

    return 0;
}
