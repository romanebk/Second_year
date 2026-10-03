#include <string>
#include <iostream>
#include <vector>

#ifndef EMPLOYE_HPP
#define EMPLOYE_HPP

class Employe {
protected:
    std::string nom;
    int salaire;
public:
    Employe(std::string _nom, int _salaire);
    virtual ~Employe();
    virtual int calculerSalaire() = 0;
    virtual void afficher() = 0;
};

class Manager : public Employe {
private:
    int bonus;
public:
    Manager(std::string _nom, int _salaire, int _bonus);
    virtual ~Manager();
    
    int calculerSalaire();
    void afficher();
};

class Developpeur : public Employe {
private:
    std::string langage_preferé;
public:
    Developpeur(std::string _nom, int _salaire, std::string _langage_preferé);
    virtual ~Developpeur();
    
    int calculerSalaire();
    void afficher();
};
#endif

