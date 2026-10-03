/*
** EPITECH PROJECT, 2026
** PointLight_hpp
** File description:
** header of a point light
*/

#ifndef POINTLIGHT_HPP_
#define POINTLIGHT_HPP_

#include "../Interfaces/ILight.hpp"
#include "../Math/Vector3.hpp"
#include "../Core/HitRecord.hpp"
#include "../Core/Scene.hpp"
#include "../Core/Ray.hpp"

class PointLight : public ILight {

    private:
        Vector3 position;
        double intensity;
        double attenuationCoeff;
        static constexpr double SHADOW_EPSILON = 1e-4;

        double computeDiffuse(const Vector3& normal, const Vector3& lightDir) const;
        double computeSpecular(const Vector3& normal, const Vector3& lightDir, const Vector3& viewDir, double shininess) const;
        bool isInShadow(const HitRecord& rec, const Scene& scene, double distToLight) const;
        double computeAttenuation(double distance) const;

    public:
        explicit PointLight(const Vector3& position, double intensity, double attenuationCoeff = 0.001);
        virtual ~PointLight() = default;

        Vector3 computeImpactLight(const HitRecord& rec, const Scene& scene) const override;

};

#endif
