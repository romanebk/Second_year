/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Assistant.hpp
*/

#ifndef ASSISTANT_HPP
#define ASSISTANT_HPP

#include <string>
#include <iostream>
#include "Student.hpp"

class Assistant {
    public:
        Assistant(int id);
        ~Assistant();
        void giveDrink(Student *student, std::string boisson);
        std::string readDrink(std::string name_of_student);
        void helpStudent(Student *student);
        void timeCheck();

    private:
        int ID;
        int assistant_is_wordking;
};

#endif
