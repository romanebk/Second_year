#include "exo.hpp"

Animal::Animal(std::string _nom, int _age, std::string _cri) : nom(_nom), age(_age), cri(_cri) {}

Animal::~Animal() {}

Lion::Lion(std::string _nom, int _age, std::string _cri) : Animal(_nom, _age, _cri) {}

Lion::~Lion() {}

Elephant::Elephant(std::string _nom, int _age, std::string _cri) : Animal(_nom, _age, _cri) {}

Elephant::~Elephant() {}

Singe::Singe(std::string _nom, int _age, std::string _cri) : Animal(_nom, _age, _cri) {}

Singe::~Singe() {}

void Lion::sePresenter()
{
    std::cout << "Je suis un " << nom << ", j'ai " << age << " ans et je " << cri << " !" << std::endl;
}

void Elephant::sePresenter()
{
    std::cout << "Je suis un " << nom << ", j'ai " << age << " ans et je " << cri << " !" << std::endl;
}

void Singe::sePresenter()
{
    std::cout << "Je suis un " << nom << ", j'ai " << age << " ans et je " << cri << " !" << std::endl;
}

Zoo::Zoo(std::vector<Animal*> _animaux) : animaux(_animaux) {}

Zoo::~Zoo() {}

void Zoo::faireTousLesCris()
{
    for (Animal* animal : animaux) {
        animal->sePresenter();
    }
}

int main()
{
    Lion lion("Simba", 5, "rugis");
    Elephant elephant("Ellie", 10, "barris");
    Singe singe("George", 3, "piaille");

    std::vector<Animal*> animaux = {&lion, &elephant, &singe};
    Zoo zoo(animaux);
    zoo.faireTousLesCris();
    return 0;
}
