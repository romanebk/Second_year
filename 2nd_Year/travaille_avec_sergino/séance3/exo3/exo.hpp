#include <string>
#include <iostream>
#include <vector>

#ifndef OPERATION_HPP
#define OPERATION_HPP

class Operation {
protected:
    int a;
    int b;
public:
    Operation(int _a, int _b);
    virtual ~Operation();
    virtual int calculer() = 0;
};

class Addition : public Operation {
public:
    Addition(int _a, int _b);
    ~Addition();
    int calculer();
};

class Soustraction : public Operation {
public:
    Soustraction(int _a, int _b);
    ~Soustraction();
    int calculer();
};

class Multiplication : public Operation {
public:
    Multiplication(int _a, int _b);
    ~Multiplication();
    int calculer();
};

class Division : public Operation {
public:
    Division(int _a, int _b);
    ~Division();
    int calculer();
};

class Calculatrice {
private:
    std::vector<Operation*> operations;
    int resultat;
public:
    Calculatrice(std::vector<Operation*> _operations);
    ~Calculatrice();
    void faireTousLesCalculs();
    void afficherResultat();
};

#endif

