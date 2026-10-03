/*
Exercise 3
*/

#include "Priest.hpp"
#include "Peasant.hpp"
#include "Enchanter.hpp"
#include "Knight.hpp"

int main(void)
{
    Priest priest("Trichelieu", 20);

    priest.attack();
    priest.special();
    priest.rest();
    priest.damage(50);
}
