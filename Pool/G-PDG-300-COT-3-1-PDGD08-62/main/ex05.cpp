/*
Exercise 5
*/

int main(void)
{
    FruitBox box(5);
    FruitMixer yourMixer;
    IFruitMixer& mixer(yourMixer);
    SteelBlade blade;
    IFruit* fruit;

    fruit = new Orange;
    fruit->peel();
    box.pushFruit(fruit);
    box.pushFruit(new Lemon);
    box.pushFruit(new Strawberry);
    box.pushFruit(new Almond);
    std::cout << box << std::endl;

    unsigned int vitamins = mixer.mixFruits(box);

    std::cout << "result: " << vitamins << std::endl;
    std::cout << box << std::endl;

    mixer.setBlade(&blade);
    vitamins = mixer.mixFruits(box);
    std::cout << "result: " << vitamins << std::endl;
    std::cout << box << std::endl;

    return 0;
}
