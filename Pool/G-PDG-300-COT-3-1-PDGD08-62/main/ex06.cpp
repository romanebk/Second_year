/*
Exercise 6
*/

int main(void)
{
    IFruit* fruit = new Strawberry;
    Hack* hack = reinterpret_cast<Hack*>(fruit);

    std::cout << *fruit << std::endl;
    hack->hack(1138);
    std::cout << *fruit << std::endl;
    delete fruit;
    return 0;
}
