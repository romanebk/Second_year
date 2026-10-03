/*
** EPITECH PROJECT, 2026
** ILight_hpp
** File description:
** header of a light interface
*/

#ifndef ILIGHT_HPP
#define ILIGHT_HPP
#include "../Math/Vector3.hpp"
#include "../Core/HitRecord.hpp"
//#include "../Core/Scene.hpp"

class Scene;
class ILight {
    public:
        virtual ~ILight() = default;

        virtual Vector3 computeImpactLight(const HitRecord& rec, const Scene& scene) const = 0;
};

#endif