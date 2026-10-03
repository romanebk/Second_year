/*
** EPITECH PROJECT, 2026
** pool
** File description:
** Droid.cpp
*/

#include "Droid.hpp"

Droid::Droid(const std::string& serial_number) : Id(serial_number), Energy(50), Attack(25), Toughness(15), Status(new std::string("Standing by"))
{
    std::cout << "Droid '" << Id << "' Activated" << std::endl;
}

Droid::Droid(const Droid& copy) : Id(copy.Id), Energy(copy.Energy), Attack(copy.Attack), Toughness(copy.Toughness), Status(new std::string(*copy.Status))
{
    std::cout << "Droid '" << Id << "' Activated, Memory Dumped" << std::endl;
}

Droid::~Droid()
{
    std::cout << "Droid '" << Id << "' Destroyed" << std::endl;
    delete Status;    
}

Droid& Droid::operator=(const Droid& other)
{
    if (this != &other) {
        Id = other.Id;
        Energy = other.Energy;
        Attack = other.Attack;
        Toughness = other.Toughness;
        delete Status;
        Status = new std::string(*other.Status);
    }
    return *this;
}

std::string Droid::getId() const
{
    return Id;
}

size_t Droid::getEnergy() const
{
    return Energy;
}

size_t Droid::getAttack() const
{
    return Attack;
}

size_t Droid::getToughness() const
{
    return Toughness;
}

std::string* Droid::getStatus() const
{
    return Status;
}

DroidMemory* Droid::getBattleData() const
{
    return BattleData;
}

void Droid::setId(const std::string& id)
{
    Id = id;
}

void Droid::setEnergy(size_t energy) {
    if (energy > 100)
        Energy = 100;
    else if (energy > 0)
        Energy = energy;
    else 
        Energy = 0;
}

void Droid::setStatus(std::string* status)
{
    delete Status;
    Status = status;
}

void Droid::setBattleData(DroidMemory* data)
{
    BattleData = data;
}

bool Droid::operator==(const Droid& other) const
{
    if (Id == other.Id && Energy == other.Energy && 
            Attack == other.Attack && Toughness == other.Toughness &&
            *Status == *other.Status)
        return true;
    else
        return false;
}

bool Droid::operator!=(const Droid& other) const
{
    if (Id != other.Id || Energy != other.Energy || 
            Attack != other.Attack || Toughness != other.Toughness ||
            *Status != *other.Status)
        return true;
    else
        return false;
}

Droid& Droid::operator<<(size_t& energy)
{
    size_t energy_needed = 100 - Energy;
    if (energy >= energy_needed) {
        size_t temp = Energy;
        Energy = 100;
        energy -= (100 - temp);
    } else {
        Energy += energy;
        energy = 0;
    }
    return *this;
}

std::ostream& operator<<(std::ostream& os, const Droid& droid)
{
    os << "Droid '" << droid.getId() << "', " << *droid.getStatus() 
       << ", " << droid.getEnergy();
    return os;
}

bool Droid::operator()(const std::string* task, size_t requiredExp) {
    if (Energy < 10) {
        delete Status;
        Status = new std::string("Battery Low");
        Energy = 0;
        return false;
    }
    
    Energy -= 10;
    
    if (*BattleData >= requiredExp) {
        delete Status;
        Status = new std::string(*task + " - Completed!");
        *BattleData += (requiredExp / 2);
        return true;
    } else {
        delete Status;
        Status = new std::string(*task + " - Failed!");
        *BattleData += requiredExp;
        return false;
    }
}