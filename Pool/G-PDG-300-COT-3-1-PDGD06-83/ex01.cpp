/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Droid.cpp
*/

#include "DroidMemory.hpp"
#include "Droid.hpp"

int main()
{
   Droid d("Avenger");
   DroidMemory mem1;
   mem1 += 42;
   DroidMemory mem2 = mem1;
   std ::cout << mem1 << std ::endl;
   DroidMemory mem3;
   mem3 << mem1;
   mem3 >> mem1;
   mem3 << mem1;
   d.setBattleData(new DroidMemory(mem2));
   std::cout << "Memorie: " << *d.getBattleData() << std::endl;
   std ::cout << mem3 << std ::endl;
   std ::cout << mem1 << std ::endl;
}