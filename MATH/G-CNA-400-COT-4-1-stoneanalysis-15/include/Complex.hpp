/*
** EPITECH PROJECT, 2026
** Complex.hpp
** File description:
** Complex number class
*/

#ifndef COMPLEX_HPP
#define COMPLEX_HPP

#include <cmath>
#include <ostream>

class Complex {
public:
    double real;
    double imag;

    Complex(double r = 0.0, double i = 0.0) noexcept;
    Complex operator+(const Complex &other) const noexcept;
    Complex operator-(const Complex &other) const noexcept;
    Complex operator*(const Complex &other) const noexcept;
    Complex &operator+=(const Complex &other) noexcept;
    double magnitude() const noexcept;
    double phase() const noexcept;
    Complex conjugate() const noexcept;
};

std::ostream &operator<<(std::ostream &os, const Complex &c);

#endif
