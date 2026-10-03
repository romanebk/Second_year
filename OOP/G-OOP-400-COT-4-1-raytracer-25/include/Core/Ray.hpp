/*
** EPITECH PROJECT, 2026
** Ray_hpp
** File description:
** header of a ray
*/

#ifndef RAY_HPP_
#define RAY_HPP_
#include "../Math/Vector3.hpp"
class Ray {
    public:
        Ray() = default;
        Ray(const Vector3& _origin, const Vector3& _direction) : origin(_origin), direction(_direction) {}
        Vector3 origin;
        Vector3 direction;
};

#endif