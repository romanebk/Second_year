/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Assistant.hpp
*/

#ifndef DEAN_HPP
#define DEAN_HPP

#include <string>
#include <iostream>
#include "Assistant.hpp"
#include "Student.hpp"

class Dean {
    public:
        Dean(int id);
        ~Dean();

    private:
        std::string dean_name;
        int dean_is_working;
};

#endif
