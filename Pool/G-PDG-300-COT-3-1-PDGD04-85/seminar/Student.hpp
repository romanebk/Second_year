/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Student.hpp
*/

#ifndef STUDENT_HPP
#define STUDENT_HPP

#include <string>
#include <iostream>
#include <fstream>
#include <string>

class Student {
    public:
        Student(std::string name);
        ~Student();
        bool learn(std::string something);
        void drink(std::string drink);
        std::string getName();

    private:
        std::string name;
        int energy;
};

#endif
