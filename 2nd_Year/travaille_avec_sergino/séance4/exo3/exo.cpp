#include "exo.hpp"
#include <stdexcept>

Operation::Operation(int _a, int _b) : a(_a), b(_b) {}

Operation::~Operation() {}

Addition::Addition(int _a, int _b) : Operation(_a, _b) {}

Addition::~Addition() {}

Soustraction::Soustraction(int _a, int _b) : Operation(_a, _b) {}

Soustraction::~Soustraction() {}

Multiplication::Multiplication(int _a, int _b) : Operation(_a, _b) {}

Multiplication::~Multiplication() {}

Division::Division(int _a, int _b) : Operation(_a, _b) {}

Division::~Division() {}

int Addition::calculer()
{
    return a + b;
}

int Soustraction::calculer()
{
    return a - b;
}

int Multiplication::calculer()
{
    return a * b;
}

int Division::calculer()
{
    if (b == 0) {
        throw std::runtime_error("Division par zéro !");
    }
    return a / b;
}

Calculatrice::Calculatrice(std::vector<Operation*> _operations) : operations(_operations), resultat(0) {}

Calculatrice::~Calculatrice() {}

void Calculatrice::faireTousLesCalculs()
{
    for (Operation* operation : operations) {
        resultat += operation->calculer();
    }
}

void Calculatrice::afficherResultat()
{
    std::cout << "Résultat: " << resultat << std::endl;
}

int main()
{
    Calculatrice calculatrice({new Addition(1, 2), new Soustraction(3, 4), new Multiplication(5, 6), new Division(7, 3)});
    try {
        calculatrice.faireTousLesCalculs();
        calculatrice.afficherResultat();
    } catch (const std::exception& e) {
        std::cout << "Erreur: " << e.what() << std::endl;
    }
    return 0;
}
