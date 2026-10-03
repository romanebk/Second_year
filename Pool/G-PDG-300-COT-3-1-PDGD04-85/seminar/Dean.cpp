/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Assistant.cpp
*/

#include "Dean.hpp"

Dean::Dean(std::string nom_du_doyen)
{
    this->dean_name = nom_du_doyen;
    this->dean_is_working = 0;
    std::cout << "Dean " << this->dean_name << ": I'm Dean " << this->dean_name << "! How do you do, fellow kids?" << std::endl;
}

Dean::~Dean()
{
    std::cout << "Dean " << this->dean_name << ": Time to go home." << std::endl;
}

void Dean::teachStudent(Student *student, std::string lesson)
{
    if (student->learn(lesson) == true) {
        std::cout << "Dean " << this->dean_name << ": All work and no play makes " << student->getName() << " a dull student." << std::endl;
    }
}






void Dean::timeCheck()
{
    if (dean_is_working == 1)
        dean_is_working = 0;
    else
        dean_is_working = 1;
    if (dean_is_working == 1) {
        std::cout << "Dean " << this->dean_name << ": " << "Where is everyone?" << std::endl;
        return;
    }
    if (dean_is_working == 0) {
        std::cout << "Dean " << this->dean_name << ": " << "Don't forget to close the windows when you leave." << std::endl;
        return;
    }
}
