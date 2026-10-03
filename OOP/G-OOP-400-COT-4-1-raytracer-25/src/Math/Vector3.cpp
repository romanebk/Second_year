/* 
** EPITECH PROJECT, 2026
** Vector3_cpp
** File description:
** implementation of a 3D vector
*/

#include "../../include/Math/Vector3.hpp"
#include <cmath>

Vector3::Vector3(double _x, double _y, double _z) : x(_x), y(_y), z(_z) {}

double Vector3::lengthSquared() const {
    return x * x + y * y + z * z;
}

double Vector3::length() const {
    return std::sqrt(lengthSquared());
}

double Vector3::dot(const Vector3& other) const {
    return x * other.x + y * other.y + z * other.z;
}

Vector3 Vector3::cross(const Vector3& other) const {
    return Vector3(
        y * other.z - z * other.y,
        z * other.x - x * other.z,
        x * other.y - y * other.x
    );
}

void Vector3::normalize() {
    double len = length();
    if (len > 0) {
        x /= len;
        y /= len;
        z /= len;
    }
}

Vector3 Vector3::normalized() const {
    double len = length();
    if (len > 0) {
        return Vector3(x / len, y / len, z / len);
    }
    return Vector3(0, 0, 0);
}

Vector3 Vector3::operator+(const Vector3& other) const {
    return Vector3(x + other.x, y + other.y, z + other.z);
}

Vector3 Vector3::operator-(const Vector3& other) const {
    return Vector3(x - other.x, y - other.y, z - other.z);
}

Vector3 Vector3::operator*(double scalar) const {
    return Vector3(x * scalar, y * scalar, z * scalar);
}

Vector3 Vector3::operator/(double scalar) const {
    return Vector3(x / scalar, y / scalar, z / scalar);
}

Vector3 Vector3::operator-() const {
    return Vector3(-x, -y, -z);
}

void Vector3::operator+=(const Vector3& other) {
    x += other.x;
    y += other.y;
    z += other.z;
}

void Vector3::operator-=(const Vector3& other) {
    x -= other.x;
    y -= other.y;
    z -= other.z;
}

void Vector3::operator*=(double scal) {
    x *= scal;
    y *= scal;
    z *= scal;
}

void Vector3::operator/=(double scal) {
    x /= scal;
    y /= scal;
    z /= scal;
}