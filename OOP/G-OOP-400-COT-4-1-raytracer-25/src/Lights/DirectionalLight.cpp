/*
** EPITECH PROJECT, 2026
** DirectionalLight_cpp
** File description:
** implementation of a directional light
*/

#include "../../include/Lights/DirectionalLight.hpp"
#include <cmath>
#include <algorithm>

DirectionalLight::DirectionalLight(const Vector3& dir, const Vector3& lightColor, double inten)
    : direction(dir.normalized()), color(lightColor), intensity(inten) {}

double DirectionalLight::computeDiffuse(const Vector3& normal, const Vector3& lightDir) const
{
    double dot_product = normal.dot(lightDir);

    return std::max(0.0, dot_product);
}

double DirectionalLight::computeSpecular(const Vector3& normal, const Vector3& lightDir, const Vector3& viewDir, double shininess) const
{
    Vector3 reflectDir = normal * 2.0 * normal.dot(lightDir) - lightDir;
    reflectDir.normalize();
    double spec = std::max(0.0, viewDir.dot(reflectDir));
    return std::pow(spec, shininess);
}

bool DirectionalLight::isInShadow(const HitRecord& rec, const Scene& scene) const
{
    Vector3 shadowOrigin = rec.point + rec.normal * SHADOW_EPSILON;

    Vector3 shadowDir = (-direction).normalized();

    Ray shadowRay(shadowOrigin, shadowDir);

    HitRecord tmpRec;

    if (scene.hitAnything(shadowRay, SHADOW_EPSILON, 1e9, tmpRec)) {
        return true;
    }

    return false;
}

Vector3 DirectionalLight::computeImpactLight(const HitRecord& rec, const Scene& scene) const
{
    if (isInShadow(rec, scene))
        return Vector3(0.0, 0.0, 0.0);

    Vector3 normal = rec.normal.normalized();
    Vector3 lightDir = (-direction).normalized();
    Vector3 viewDir = rec.viewDir.normalized();

    double diffuse = computeDiffuse(normal, lightDir);
    diffuse *= scene.getDiffuseMultiplier();

    Vector3 mat = rec.couleur;
    double diffFactor = intensity * diffuse;

    Vector3 result;
    result.x = mat.x * color.x * diffFactor;
    result.y = mat.y * color.y * diffFactor;
    result.z = mat.z * color.z * diffFactor;

    if (rec.shininess > 0.0) {
        double spec = computeSpecular(normal, lightDir, viewDir, rec.shininess);
        double specFactor = intensity * spec * 0.5;
        result.x += color.x * specFactor;
        result.y += color.y * specFactor;
        result.z += color.z * specFactor;
    }

    return result;
}
