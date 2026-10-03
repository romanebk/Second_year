/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Student.cpp
*/

#include "Student.hpp"

std::string Student::getName()
{
    return this->name;
}

void replace_string(std::string& chaine_originale, const std::string& a_remplacer, const std::string& remplacement)
{
    size_t index = chaine_originale.find(a_remplacer);
    while (index != std::string::npos) {
        chaine_originale.replace(index, a_remplacer.length(), remplacement);
        index = chaine_originale.find(a_remplacer, index + remplacement.length());
    }
    return;
}

Student::Student(std::string name)
{
    this->name = name;
    this->energy = 100;
    std::cout << "Student " << this->name << ": I'm ready to learn C++." << std::endl;
}

Student::~Student()
{
    std::cout << "Student " << this->name << ": Wow, much learning today, very smart, such C++." << std::endl;
}

bool Student::learn(std::string something)
{
    if (this->energy >= 42) {
        this->energy -= 42;
        std::cout << "Student " << this->name << ": " << something << std::endl;
        return true;
    }
    else {
        replace_string(something, "C++", "shit");
        std::cout << "Student " << this->name  << ": " << something << std::endl;
        return false;
    }
}

void Student::drink(std::string drink)
{
    if (drink == "Red Bull") {
        this->energy += 32;
        std::cout << "Student " << this->name << ": Red Bull gives you wings!" << std::endl;
    }
    else if (drink == "Monster") {
        this->energy += 64;
        std::cout << "Student " << this->name << ": Unleash The Beast!" << std::endl;
    }
    else {
        this->energy += 1;
        std::cout << "Student " << this->name << ": ah, yes... enslaved moisture." << std::endl;
    }
}
