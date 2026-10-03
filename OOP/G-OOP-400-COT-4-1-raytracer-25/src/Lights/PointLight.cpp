/* 
** EPITECH PROJECT, 2026
** PointLight_cpp
** File description:
** implementation of a point light
*/

#include "../../include/Lights/PointLight.hpp"
#include <cmath>
#include <algorithm>

PointLight::PointLight(const Vector3& position, double intensity, double attenuationCoeff)
    : position(position), intensity(intensity), attenuationCoeff(attenuationCoeff) {}

double PointLight::computeDiffuse(const Vector3& normal, const Vector3& lightDir) const
{
    double dot_product = normal.dot(lightDir);
    return std::max(0.0, dot_product);
}

double PointLight::computeSpecular(const Vector3& normal, const Vector3& lightDir, const Vector3& viewDir, double shininess) const
{
    Vector3 reflectDir = normal * 2.0 * normal.dot(lightDir) - lightDir;
    reflectDir.normalize();
    double spec = std::max(0.0, viewDir.dot(reflectDir));
    return std::pow(spec, shininess);
}

double PointLight::computeAttenuation(double distance) const
{
    double denom = 1.0 + attenuationCoeff * distance * distance;
    return 1.0 / denom;
}

bool PointLight::isInShadow(const HitRecord& rec, const Scene& scene, double distToLight) const
{
    Vector3 shadowOrigin = rec.point + rec.normal * SHADOW_EPSILON;

    Vector3 toLight = position - rec.point;
    Vector3 shadowDir = toLight.normalized();

    Ray shadowRay(shadowOrigin, shadowDir);

    HitRecord tmpRec;

    if (scene.hitAnything(shadowRay, SHADOW_EPSILON, distToLight - SHADOW_EPSILON, tmpRec)) {
        return true;
    }

    return false;
}

Vector3 PointLight::computeImpactLight(const HitRecord& rec, const Scene& scene) const
{
    Vector3 toLight = position - rec.point;

    double distance = toLight.length();

    if (distance < 1e-6) {
        distance = 1e-6;
    }

    Vector3 lightDir = toLight.normalized();

    Vector3 normal = rec.normal.normalized();

    Vector3 viewDir = rec.viewDir.normalized();

    double diffuse = computeDiffuse(normal, lightDir);

    diffuse *= scene.getDiffuseMultiplier();

    double attenuation = computeAttenuation(distance);

    if (isInShadow(rec, scene, distance)) {
        return Vector3(0, 0, 0);
    }

    Vector3 result = rec.couleur * intensity * diffuse * attenuation;

    if (rec.shininess > 0.0) {
        double spec = computeSpecular(normal, lightDir, viewDir, rec.shininess);
        result = result + Vector3(1, 1, 1) * intensity * spec * attenuation * 0.5;
    }

    return result;
}
