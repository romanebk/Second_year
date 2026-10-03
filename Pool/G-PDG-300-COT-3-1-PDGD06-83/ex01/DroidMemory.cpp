/*
** EPITECH PROJECT, 2026
** pool
** File description:
** DroidMemory.cpp
*/

#include "DroidMemory.hpp"

DroidMemory::DroidMemory() : Fingerprint(rand()), Exp(0) {}

DroidMemory::DroidMemory(const DroidMemory& other) : Fingerprint(other.Fingerprint), Exp(other.Exp) {}

DroidMemory::~DroidMemory() {}

DroidMemory& DroidMemory::operator=(const DroidMemory& other)
{
    if (this != &other) {
        Fingerprint = other.Fingerprint;
        Exp = other.Exp;
    }
    return *this;
}

size_t DroidMemory::getFingerprint() const
{
    return Fingerprint;
}

size_t DroidMemory::getExp() const
{
    return Exp;
}

void DroidMemory::setFingerprint(size_t fingerprint)
{
    Fingerprint = fingerprint;
}

void DroidMemory::setExp(size_t exp)
{
    Exp = exp;
}

DroidMemory& DroidMemory::operator<<(const DroidMemory& other)
{
    Exp = Exp + other.Exp;
    Fingerprint = Fingerprint ^ other.Fingerprint;
    return *this;
}

DroidMemory& DroidMemory::operator>>(DroidMemory& other)
{
    other.Exp = other.Exp + Exp;
    other.Fingerprint = other.Fingerprint ^ Fingerprint;
    return *this;
}

DroidMemory& DroidMemory::operator+=(const DroidMemory& other)
{
    Exp = Exp + other.Exp;
    Fingerprint = Fingerprint ^ other.Fingerprint;
    return *this;
}

DroidMemory& DroidMemory::operator+=(size_t value)
{
    Exp = Exp + value;
    Fingerprint = Fingerprint ^ value;
    return *this;
}

DroidMemory DroidMemory::operator+(const DroidMemory& other) const
{
    DroidMemory result(*this);
    result += other;
    return result;
}

DroidMemory DroidMemory::operator+(size_t value) const
{
    DroidMemory result(*this);
    result += value;
    return result;
}

bool DroidMemory::operator==(const DroidMemory& other) const
{
    if (Exp == other.Exp && Fingerprint == other.Fingerprint)
        return true;
    else    
        return false;
}

bool DroidMemory::operator!=(const DroidMemory& other) const
{
    if (Exp != other.Exp || Fingerprint != other.Fingerprint)
        return true;
    else
        return false;
}

bool DroidMemory::operator<(const DroidMemory& other) const
{
    if (Exp < other.Exp)
        return true;
    else
        return false;
}

bool DroidMemory::operator>(const DroidMemory& other) const
{
    if (Exp > other.Exp)
        return true;
    else
        return false;
}

bool DroidMemory::operator<=(const DroidMemory& other) const
{
    if (Exp <= other.Exp)
        return true;
    else
        return false;
}

bool DroidMemory::operator>=(const DroidMemory& other) const
{
    if (Exp >= other.Exp)
        return true;
    else
        return false;
}

bool DroidMemory::operator<(size_t value) const
{
    if (Exp < value)
        return true;
    else
        return false;
}

bool DroidMemory::operator>(size_t value) const
{
    if (Exp > value)
        return true;
    else
        return false;
}

bool DroidMemory::operator<=(size_t value) const
{
    if (Exp <= value)
        return true;
    else
        return false;
}

bool DroidMemory::operator>=(size_t value) const
{
    if (Exp >= value)
        return true;
    else
        return false;
}

std::ostream& operator<<(std::ostream& os, const DroidMemory& mem)
{
    os << "DroidMemory '" << mem.getFingerprint() << "', " << mem.getExp();
    return os;
}
