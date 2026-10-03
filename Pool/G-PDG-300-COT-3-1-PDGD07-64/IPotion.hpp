/*
** EPITECH PROJECT, 2026
** pool
** File description:
** IPotion.hpp
*/

#ifndef IPOTION_HPP
#define IPOTION_HPP

class IPotion {
    public:
        virtual ~IPotion() = default;
        virtual int getHealthEffect() const = 0;
        virtual int getPowerEffect() const = 0;
        virtual const char* getType() const = 0;
        virtual void drink(const IPotion &potion ) = 0;
};

#endif