/*
** EPITECH PROJECT, 2026
** Paradigms Seminar
** File description:
** Day 09
*/

#pragma once

class IObject
{
public:
    virtual ~IObject() = default;

    virtual void touch() = 0;
};
