/*
Exercise 6
*/

int main(void)
{
    ICharacter *peasant = new Peasant("Gildas", 42);
    PoisonPotion poison_potion;
    HealthPotion health_potion;
    IPotion& potion = health_potion;

    std::cout << peasant->getName() << ": " << peasant->getHp() << "HP, "
              << peasant->getPower() << " PP." << std::endl;
    peasant->drink(poison_potion);
    std::cout << peasant->getName() << ": " << peasant->getHp() << "HP, "
              << peasant->getPower() << " PP." << std::endl;
    peasant->drink(potion);
    std::cout << peasant->getName() << ": " << peasant->getHp() << "HP, "
              << peasant->getPower() << " PP." << std::endl;

    delete peasant;
}
