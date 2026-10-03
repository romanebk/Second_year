/* 
** EPITECH PROJECT, 2026
** AmbientLight_cpp
** File description:
** implementation of an ambient light
*/

#include "../../include/Lights/AmbientLight.hpp"

AmbientLight::AmbientLight(double intensity) : intensity(intensity){}

Vector3 AmbientLight::computeImpactLight(const HitRecord& rec, const Scene& scene) const
{
    (void)scene;

    return rec.couleur * intensity;
}
