/*
** EPITECH PROJECT, 2026
** pool
** File description:
** IFruit.hpp
*/

#ifndef IFRUIT_HPP
#define IFRUIT_HPP

#include <string>
#include <iostream>

class IFruit {
    public:
        virtual ~IFruit() = default;
        virtual unsigned int getVitamins() const = 0;
        virtual std::string getName() const = 0;
        virtual bool isPeeled() const = 0;
        virtual void peel() = 0;
};

std::ostream& operator<<(std::ostream& os, const IFruit& fruit);

#endif
