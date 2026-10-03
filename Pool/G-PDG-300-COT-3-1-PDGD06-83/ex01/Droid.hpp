/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Droid.hpp
*/

#ifndef DROID_HPP
#define DROID_HPP

#include <string>
#include <iostream>

class DroidMemory;
class Droid {
    public:
        Droid(const std::string& serial_number = "");
        Droid(const Droid& other);
        ~Droid();

        std::string getId() const;
        size_t getEnergy() const;
        size_t getAttack() const;
        size_t getToughness() const;
        std::string* getStatus() const;
        DroidMemory* getBattleData() const;

        void setId(const std::string& id);
        void setEnergy(size_t energy);
        void setStatus(std::string* status);
        void setBattleData(DroidMemory* battle_data);

        bool operator==(const Droid& other) const;
        bool operator!=(const Droid& other) const;
        Droid& operator<<(size_t& energy);
        Droid& operator=(const Droid& other);

    private:
        std::string Id;
        size_t Energy;
        size_t Attack;
        size_t Toughness;
        std::string* Status;
        DroidMemory* BattleData;
};

std::ostream& operator<<(std::ostream& os, const Droid& droid);

#endif