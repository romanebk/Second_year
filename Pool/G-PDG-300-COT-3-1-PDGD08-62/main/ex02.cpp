#include "../FruitBox.hpp"
#include "../FruitUtils.hpp"
#include "../Lemon.hpp"
#include "../Orange.hpp"
#include "../BloodOrange.hpp"
#include "../Grapefruit.hpp"
#include "../Raspberry.hpp"
#include "../Strawberry.hpp"
#include "../Almond.hpp"
#include <iostream>

int main()
{
    FruitBox unsorted(10);
    FruitBox lemon(5);
    FruitBox citrus(5);
    FruitBox berry(5);

    std::cout << "--- Filling unsorted box ---" << std::endl;
    unsorted.pushFruit(new Lemon());         // "lemon"
    unsorted.pushFruit(new Orange());        // "orange"
    unsorted.pushFruit(new BloodOrange());   // "blood orange"
    unsorted.pushFruit(new Grapefruit());    // "grapefruit"
    unsorted.pushFruit(new Raspberry());     // "raspberry"
    unsorted.pushFruit(new Strawberry());    // "strawberry"
    unsorted.pushFruit(new Almond());        // "almond" (should stay in unsorted)

    std::cout << "Unsorted box: " << unsorted << std::endl;

    std::cout << "\n--- Sorting ---" << std::endl;
    FruitUtils::sort(unsorted, lemon, citrus, berry);

    std::cout << "Unsorted box (remaining): " << unsorted << std::endl;
    std::cout << "Lemon box:    " << lemon << std::endl;
    std::cout << "Citrus box:   " << citrus << std::endl;
    std::cout << "Berry box:    " << berry << std::endl;

    return 0;
}
