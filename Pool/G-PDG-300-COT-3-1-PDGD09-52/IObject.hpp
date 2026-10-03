/*
** EPITECH PROJECT, 2026
** Paradigms Seminar
** File description:
** Day 09
*/

#pragma once

#include <string>
#include <iostream>
#include <ostream>

class IObject
{
public:
    virtual ~IObject() = default;

    virtual void touch() = 0;
};
