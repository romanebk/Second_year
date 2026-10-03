#include <string>
#include <iostream>
#include <vector>

#ifndef ANIMAL_HPP
#define ANIMAL_HPP

class Animal {
protected:
    std::string nom;
    int age;
    std::string cri;
public:
    Animal(std::string _nom, int _age, std::string _cri);
    virtual ~Animal();
    virtual void sePresenter() = 0;
};

class Lion : public Animal {
public:
    Lion(std::string _nom, int _age, std::string _cri);
    ~Lion();
    void sePresenter();
};

class Elephant : public Animal {
public:
    Elephant(std::string _nom, int _age, std::string _cri);
    ~Elephant();
    void sePresenter();
};

class Singe : public Animal {
public:
    Singe(std::string _nom, int _age, std::string _cri);
    ~Singe();
    void sePresenter();
};

class Zoo {
private:
    std::vector<Animal*> animaux;
public:
    Zoo(std::vector<Animal*> _animaux);
    ~Zoo();
    void faireTousLesCris();
};

#endif

