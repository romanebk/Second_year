/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Human.hpp
*/

#ifndef HUMAN_HPP
#define HUMAN_HPP

#include <string>
#include <iostream>
#include <fstream>
#include <string>
#include <ostream>
#include "Cyberman.hpp"

namespace Mondas {
    class Human {
        public:
            Human(std::string name, unsigned int iq);
            Human(std::string _name);
            Human(std::string name, unsigned int iq, Cyberman::Inhibitor *inhibitor);
            Human(std::string name, Cyberman::Inhibitor *inhibitor);
            ~Human();
            std::string getName() const;
            unsigned int getIq() const;
            void setIq(unsigned int new_iq);
            void think() const;
            void setInhibitor(Cyberman::Inhibitor *inhibitor);
            Cyberman::Inhibitor* getInihibitor();
            const Cyberman::Inhibitor* getInihibitor() const;
        private:
            Cyberman::Inhibitor *inhibitor;
            std::string _name;
            unsigned int _iq;
    };
}

#endif
