/*
** EPITECH PROJECT, 2026
** AmbientLight_hpp
** File description:
** header of an ambient light
*/

#ifndef AMBIENTLIGHT_HPP_
#define AMBIENTLIGHT_HPP_

#include "../Interfaces/ILight.hpp"
#include "../Math/Vector3.hpp"
#include "../Core/HitRecord.hpp"
#include "../Core/Scene.hpp"

class AmbientLight : public ILight {

    private:
        double intensity;

    public:
        explicit AmbientLight(double intensity);
        ~AmbientLight() = default;

        Vector3 computeImpactLight(const HitRecord& rec, const Scene& scene) const override;
};

#endif
