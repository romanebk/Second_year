/*
** EPITECH PROJECT, 2026
** pool
** File description:
** DroidMemory.cpp
*/

#ifndef DROIDMEMORY_HPP
#define DROIDMEMORY_HPP

#include <iostream>
#include <cstdlib>

class DroidMemory {
private:
    size_t Fingerprint;
    size_t Exp;

public:
    DroidMemory();
    DroidMemory(const DroidMemory& other);
    DroidMemory& operator=(const DroidMemory& other);
    ~DroidMemory();

    size_t getFingerprint() const;
    size_t getExp() const;

    void setFingerprint(size_t fingerprint);
    void setExp(size_t exp);

    DroidMemory& operator<<(const DroidMemory& other);
    DroidMemory& operator>>(DroidMemory& other);
    DroidMemory& operator+=(const DroidMemory& other);
    DroidMemory& operator+=(size_t value);
    DroidMemory operator+(const DroidMemory& other) const;
    DroidMemory operator+(size_t value) const;

    bool operator==(const DroidMemory& other) const;
    bool operator!=(const DroidMemory& other) const;
    bool operator<(const DroidMemory& other) const;
    bool operator>(const DroidMemory& other) const;
    bool operator<=(const DroidMemory& other) const;
    bool operator>=(const DroidMemory& other) const;
    bool operator<(size_t value) const;
    bool operator>(size_t value) const;
    bool operator<=(size_t value) const;
    bool operator>=(size_t value) const;
};

std::ostream& operator<<(std::ostream& os, const DroidMemory& mem);

#endif