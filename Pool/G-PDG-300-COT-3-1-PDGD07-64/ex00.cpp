#include "Peasant.hpp"

/*
Exercise 0
*/

int main(void)
{
    Peasant peasant("Gildas", 42);

    peasant.damage(50);
    peasant.damage(100);
    peasant.damage(200);
    peasant.rest();
}
