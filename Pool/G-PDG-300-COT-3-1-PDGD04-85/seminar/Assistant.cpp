/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Assistant.cpp
*/

#include "Assistant.hpp"
#include "Student.hpp"

Assistant::Assistant(int id)
{
    this->ID = id;
    this->assistant_is_wordking = 0;
    std::cout << "Assistant " << this->ID << ": 'morning everyone *sip coffee*" << std::endl;
}

Assistant::~Assistant()
{
    std::cout << "Assistant " << this->ID << ": see you tomorrow at 9.00 *sip coffee*" << std::endl;
}

int Assistant::getId()
{
    return this->ID;
}

void Assistant::giveDrink(Student *student, std::string boisson)
{
    std::cout << "Assistant " << this->ID << ": drink this, " << student->getName() << " *sip coffee*" << std::endl;
    student->drink(boisson);
}

std::string Assistant::readDrink(std::string name_of_student)
{
    int a = 0;
    std::string filename = name_of_student + ".drink";
    std::string content;
    std::ifstream file(filename);

    if (file.is_open()) {
        while (std::getline(file, content)) {
            content = content + "\n";
        }
        file.close();
    }
    content[content.length() - 1] = '\0';
    if (content != "") {
        std::cout << "Assistant " << this->ID << ": " << name_of_student << " needs a " << content << " *sip coffee*" << std::endl;
        return content;
    }
    a = remove(filename.c_str());
    return "";
}

void Assistant::helpStudent(Student *student)
{
    std::string report = readDrink(student->getName());
    if (report == "") {
        std::cout << "Assistant " << this->ID << ": " << student->getName() << " seems fine * sip coffee*" << std::endl;
        return;
    }
    giveDrink(student, report);
}

void Assistant::timeCheck()
{
    if (assistant_is_wordking == 1)
        assistant_is_wordking = 0;
    else
        assistant_is_wordking = 1;
    if (assistant_is_wordking == 1) {
        std::cout << "Assistant " << this->ID << ": " << "Time to teach some serious business *sip coffee*" << std::endl;
        return;
    }
    if (assistant_is_wordking == 0) {
        std::cout << "Assistant " << this->ID << ": " << "Enough teaching for today *sip coffee*" << std::endl;
        return;
    }
}
