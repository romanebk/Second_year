/*
** EPITECH PROJECT, 2026
** Cylinder_cpp
** File description:
** implementation of a cylinder
*/

#include "../../include/Primitives/Cylinder.hpp"
#include <cmath>

Cylinder::Cylinder(const Vector3& center, double radius, double height, const Vector3& color,
                   const Vector3& translation, const Matrix4& rotation,
                   double reflectivity, double shininess)
    : center(center), radius(radius), height(height), color(color), translation(translation),
      rotation(rotation), invRotation(rotation.inverse()),
      reflectivity(reflectivity), shininess(shininess) {}

bool Cylinder::hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const
{
    Vector3 localOrigin = invRotation * (ray.origin - translation);
    Vector3 localDir = invRotation * ray.direction;
    Vector3 oc = localOrigin - center;

    double a = localDir.x * localDir.x
             + localDir.z * localDir.z;
    double b = 2.0 * (oc.x * localDir.x
             + oc.z * localDir.z);
    double c = oc.x * oc.x + oc.z * oc.z - radius * radius;

    if (std::abs(a) < 1e-12)
        return false;

    double discriminant = b * b - 4 * a * c;
    if (discriminant < 0)
        return false;

    double sqrtD = std::sqrt(discriminant);
    double t1 = (-b - sqrtD) / (2.0 * a);
    double t2 = (-b + sqrtD) / (2.0 * a);

    double t = -1.0;
    double y_hit = 0.0;

    if (t1 >= t_min && t1 <= t_max) {
        y_hit = oc.y + t1 * localDir.y;
        if (y_hit >= 0 && y_hit <= height)
            t = t1;
    }

    if (t < 0 && t2 >= t_min && t2 <= t_max) {
        y_hit = oc.y + t2 * localDir.y;
        if (y_hit >= 0 && y_hit <= height)
            t = t2;
    }

    if (t < 0)
        return false;

    rec.t = t;
    rec.point = ray.origin + ray.direction * t;
    Vector3 localHit = localOrigin + localDir * t;
    Vector3 localNormal = Vector3(localHit.x / radius, 0, localHit.z / radius);
    rec.normal = rotation * localNormal;
    rec.normal.normalize();
    rec.couleur = color;
    rec.reflectivity = reflectivity;
    rec.shininess = shininess;
    return true;
}