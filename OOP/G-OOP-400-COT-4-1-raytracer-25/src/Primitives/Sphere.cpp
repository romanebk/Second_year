/*
** EPITECH PROJECT, 2026
** Sphere_cpp
** File description:
** implementation of a sphere
*/

#include "../../include/Primitives/Sphere.hpp"
#include <cmath>

Sphere::Sphere(const Vector3& center, double radius, const Vector3& color,
               const Vector3& translation, const Matrix4& rotation,
               double reflectivity, double shininess)
    : center(center), radius(radius), color(color), translation(translation),
      rotation(rotation), invRotation(rotation.inverse()),
      reflectivity(reflectivity), shininess(shininess) {}

bool Sphere::hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const
{
    Vector3 localOrigin = invRotation * (ray.origin - translation);
    Vector3 localDir = invRotation * ray.direction;

    Vector3 oc = localOrigin - center;

    double a = localDir.dot(localDir);
    double b = 2.0 * oc.dot(localDir);
    double c = oc.dot(oc) - radius * radius;

    double discriminant = (b * b) - (4 * a * c);
    if (discriminant < 0)
        return false;

    double sqrtD = std::sqrt(discriminant);
    double t = (-b - sqrtD) / (2.0 * a);
    if (t < t_min || t > t_max) {
        t = (-b + sqrtD) / (2.0 * a);
        if (t < t_min || t > t_max)
            return false;
    }

    rec.t = t;
    rec.point = ray.origin + ray.direction * t;
    Vector3 localHit = localOrigin + localDir * t;
    Vector3 localNormal = (localHit - center) / radius;
    rec.normal = rotation * localNormal;
    rec.normal.normalize();
    rec.couleur = color;
    rec.reflectivity = reflectivity;
    rec.shininess = shininess;
    return true;
}
