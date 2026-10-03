/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Cyberman.hpp
*/

#ifndef CYBERMAN_HPP
#define CYBERMAN_HPP

#include <string>

namespace Mondas {
    class Human;
    class Cyberman {
    public:
        class Inhibitor {
            public:
                Inhibitor();
                ~Inhibitor();
                bool get() const;
                void set(bool state);
            private:
                bool _state;
        };
        Cyberman(Human& human);
        ~Cyberman();
        Human& getHuman();
        const Human& getHuman() const;
        void think() const;
        unsigned int getIq() const;
    private:
        std::string convertToLeet(const std::string& name) const;
        Human& _human;
    };
}

#endif
