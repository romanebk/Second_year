/*
Exercise 4
*/

#include "Paladin.hpp"
#include "Priest.hpp"
#include "Enchanter.hpp"
#include "Knight.hpp"
#include "Peasant.hpp"

int main(void)
{
    Paladin paladin("Uther", 99);

    paladin.attack();
    paladin.special();
    paladin.rest();
    paladin.damage(50);
}
