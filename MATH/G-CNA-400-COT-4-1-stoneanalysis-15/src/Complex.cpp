/*
** EPITECH PROJECT, 2026
** Complex.cpp
** File description:
** Complex number operations
*/

#include "Complex.hpp"

Complex::Complex(double r, double i) noexcept : real(r), imag(i) {}

Complex Complex::operator+(const Complex &other) const noexcept
{
    return Complex(real + other.real, imag + other.imag);
}

Complex Complex::operator-(const Complex &other) const noexcept
{
    return Complex(real - other.real, imag - other.imag);
}

Complex Complex::operator*(const Complex &other) const noexcept
{
    return Complex(
        real * other.real - imag * other.imag,
        real * other.imag + imag * other.real
    );
}

Complex &Complex::operator+=(const Complex &other) noexcept
{
    real += other.real;
    imag += other.imag;
    return *this;
}

double Complex::magnitude() const noexcept
{
    return std::sqrt(real * real + imag * imag);
}

double Complex::phase() const noexcept
{
    return std::atan2(imag, real);
}

Complex Complex::conjugate() const noexcept
{
    return Complex(real, -imag);
}

std::ostream &operator<<(std::ostream &os, const Complex &c)
{
    os << "(" << c.real << " + " << c.imag << "i)";
    return os;
}
