/*
** EPITECH PROJECT, 2026
** Plane_cpp
** File description:
** implementation of a plane
*/

#include "../../include/Primitives/Plane.hpp"
#include <cmath>

Plane::Plane(const std::string& axis, double position, const Vector3& color,
             const Vector3& translation, const Matrix4& rotation,
             double reflectivity, double shininess)
    : axis(axis), position(position), color(color), translation(translation),
      rotation(rotation), invRotation(rotation.inverse()),
      reflectivity(reflectivity), shininess(shininess) {}

bool Plane::hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const
{
    Vector3 localOrigin = invRotation * (ray.origin - translation);
    Vector3 localDir = invRotation * ray.direction;

    double origin_val = 0;
    double dir_val = 0;
    Vector3 localNormal;

    if (axis == "X") {
        origin_val = localOrigin.x;
        dir_val = localDir.x;
        localNormal = Vector3(1, 0, 0);
    } else if (axis == "Y") {
        origin_val = localOrigin.y;
        dir_val = localDir.y;
        localNormal = Vector3(0, 1, 0);
    } else {
        origin_val = localOrigin.z;
        dir_val = localDir.z;
        localNormal = Vector3(0, 0, 1);
    }

    if (std::fabs(dir_val) < 1e-8)
        return false;

    double t = (position - origin_val) / dir_val;
    if (t < t_min || t > t_max)
        return false;

    rec.t = t;
    rec.point = ray.origin + ray.direction * t;
    rec.normal = rotation * localNormal;
    rec.normal.normalize();
    rec.couleur = color;
    rec.reflectivity = reflectivity;
    rec.shininess = shininess;
    return true;
}
