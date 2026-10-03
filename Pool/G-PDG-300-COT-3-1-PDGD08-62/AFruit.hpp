/*
** EPITECH PROJECT, 2026
** pool
** File description:
** AFruit.hpp
*/

#include "IFruit.hpp"

#ifndef AFRUIT_HPP
#define AFRUIT_HPP

class AFruit : public IFruit {
    public:
        AFruit(std::string const &name, unsigned int vitamins);
        virtual ~AFruit() = 0;
        virtual unsigned int getVitamins() const override;
        virtual std::string getName() const override;
        virtual bool isPeeled() const override;
        virtual void peel() override;
    protected:
        std::string _name;
        unsigned int _vitamins;
        bool _peeled;
};

#endif
