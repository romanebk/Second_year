#include "exo.hpp"

Employe::Employe(std::string _nom, int _salaire) : nom(_nom), salaire(_salaire) {}

Employe::~Employe() {}

Manager::Manager(std::string _nom, int _salaire, int _bonus) : Employe(_nom, _salaire), bonus(_bonus) {}

Manager::~Manager() {}

Developpeur::Developpeur(std::string _nom, int _salaire, std::string _langage_preferé) : Employe(_nom, _salaire), langage_preferé(_langage_preferé) {}

Developpeur::~Developpeur() {}

int Manager::calculerSalaire()
{
    return salaire + bonus;
}

void Manager::afficher()
{
    std::cout << "Nom: " << nom << std::endl;
    std::cout << "Salaire: " << salaire << std::endl;
    std::cout << "Bonus: " << bonus << std::endl;
}

int Developpeur::calculerSalaire()
{
    return salaire;
}

void Developpeur::afficher()
{
    std::cout << "Nom: " << nom << std::endl;
    std::cout << "Salaire: " << salaire << std::endl;
    std::cout << "Langage préféré: " << langage_preferé << std::endl;
}

int main()
{
    Manager m("Alice", 3000, 500);
    Developpeur d("Bob", 2500, "C++");

    
    std::vector<Employe *> equipe = {&m, &d};
    int i = 0, j = 0;
    for (auto *e : equipe) i++;
    std::cout << "Nombre d'employés: " << i << std::endl;
    for (auto *e : equipe) {
        e->afficher();
        std::cout << "Salaire total : " << e->calculerSalaire() << std::endl;
        if (j < i - 1) {
            std::cout << std::endl;
        }
        j++;
    }
    return 0;
}