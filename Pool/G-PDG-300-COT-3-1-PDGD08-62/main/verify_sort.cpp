#include "../FruitBox.hpp"
#include "../FruitUtils.hpp"
#include "../Lemon.hpp"
#include "../Orange.hpp"
#include "../BloodOrange.hpp"
#include "../Raspberry.hpp"
#include "../Strawberry.hpp"
#include "../Almond.hpp"
#include <iostream>

int main()
{
    FruitBox unsorted(10);
    FruitBox lemon_box(5);
    FruitBox citrus_box(5);
    FruitBox berry_box(5);

    // Add fruits in a specific order to test if some are skipped
    unsorted.pushFruit(new Lemon());       // Correct sorted: lemon
    unsorted.pushFruit(new Raspberry());   // Correct sorted: berry
    unsorted.pushFruit(new Lemon());       // Correct sorted: lemon
    unsorted.pushFruit(new Strawberry());  // Correct sorted: berry
    unsorted.pushFruit(new Orange());      // Correct sorted: citrus
    unsorted.pushFruit(new Almond());      // Unsorted

    std::cout << "--- Before Sort ---" << std::endl;
    std::cout << "Unsorted: " << unsorted << std::endl;

    FruitUtils::sort(unsorted, lemon_box, citrus_box, berry_box);

    std::cout << "\n--- After Sort ---" << std::endl;
    std::cout << "Remaining Unsorted: " << unsorted << std::endl;
    std::cout << "Lemon Box:          " << lemon_box << std::endl;
    std::cout << "Citrus Box:         " << citrus_box << std::endl;
    std::cout << "Berry Box:          " << berry_box << std::endl;

    return 0;
}
