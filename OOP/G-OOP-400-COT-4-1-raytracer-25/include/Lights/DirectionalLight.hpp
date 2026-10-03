/*
** EPITECH PROJECT, 2026
** DirectionalLight_hpp
** File description:
** header of a directional light
*/

#ifndef DIRECTIONALLIGHT_HPP_
#define DIRECTIONALLIGHT_HPP_

#include "../Interfaces/ILight.hpp"
#include "../Math/Vector3.hpp"
#include "../Core/HitRecord.hpp"
#include "../Core/Scene.hpp"
#include "../Core/Ray.hpp"

class DirectionalLight : public ILight {

    private:
        double computeDiffuse(const Vector3& normal, const Vector3& lightDir) const;
        double computeSpecular(const Vector3& normal, const Vector3& lightDir, const Vector3& viewDir, double shininess) const;
        bool isInShadow(const HitRecord& rec, const Scene& scene) const;
        static constexpr double SHADOW_EPSILON = 1e-4;

    public:
        DirectionalLight(const Vector3& dir, const Vector3& lightColor, double inten);
        ~DirectionalLight() = default;
        Vector3 computeImpactLight(const HitRecord& rec, const Scene& scene) const override;

        Vector3 direction;
        Vector3 color;
        double intensity;
};

#endif
