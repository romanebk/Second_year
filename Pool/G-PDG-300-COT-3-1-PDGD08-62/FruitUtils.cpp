/*
** EPITECH PROJECT, 2026
** pool
** File description:
** FruitUtils.cpp
*/

#include "FruitUtils.hpp"

void FruitUtils::sort(FruitBox& unsorted, FruitBox& lemon, FruitBox& citrus, FruitBox& berry)
{
    unsigned int first_it = unsorted.nbFruits();

    for (unsigned int i = 0; i < first_it; i++) {
        IFruit *fruit = unsorted.popFruit();
        if (!fruit)
            continue;
        bool pushed = false;
        if (dynamic_cast<Lemon*>(fruit))
            pushed = lemon.pushFruit(fruit);
        else if (dynamic_cast<ACitrus*>(fruit))
            pushed = citrus.pushFruit(fruit);
        else if (dynamic_cast<ABerry*>(fruit))
            pushed = berry.pushFruit(fruit);
        if (!pushed)
            unsorted.pushFruit(fruit);
    }
}

FruitBox** FruitUtils::pack(IFruit** fruits, unsigned int boxSize)
{
    unsigned int nbFruits = 0;
    for (; fruits[nbFruits] != nullptr; nbFruits++);
    if (nbFruits == 0 || boxSize == 0)
        return nullptr;
    unsigned int nbBoxes = nbFruits / boxSize;
    if (nbFruits % boxSize != 0)
        nbBoxes = nbBoxes + 1;
    FruitBox** boxes = new FruitBox*[nbBoxes + 1];
    boxes[nbBoxes] = nullptr;
    for (unsigned int i = 0; i < nbBoxes; i++)
        boxes[i] = new FruitBox(boxSize);
    unsigned int index = 0;
    for (unsigned int i = 0; i < nbFruits; i++) {
        if (boxes[index]->pushFruit(fruits[i]) == false) {
            index++;
            boxes[index]->pushFruit(fruits[i]);
        }
    }
    return boxes;
}

IFruit** FruitUtils::unpack(FruitBox** fruitBoxes)
{
    unsigned int nbFruits = 0;
    unsigned int nbBoxes = 0;
    for (; fruitBoxes[nbBoxes] != nullptr; nbBoxes++)
        nbFruits += fruitBoxes[nbBoxes]->nbFruits();
    IFruit** unpacked = new IFruit*[nbFruits + 1];
    unpacked[nbFruits] = nullptr;
    unsigned int index = 0;
    for (unsigned int i = 0; i < nbBoxes; i++) {
        while (fruitBoxes[i]->nbFruits() > 0)
            unpacked[index++] = fruitBoxes[i]->popFruit();
    }
    return unpacked;
}