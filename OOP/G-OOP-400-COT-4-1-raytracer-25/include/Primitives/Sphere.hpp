/*
** EPITECH PROJECT, 2026
** Sphere_hpp
** File description:
** header of a sphere
*/

#ifndef SPHERE_HPP_
#define SPHERE_HPP_

#include "../Interfaces/IPrimitive.hpp"
#include "../Math/Vector3.hpp"
#include "../Math/Matrix4.hpp"

class Sphere : public IPrimitive {
    private:
        Vector3 center;
        double radius;
        Vector3 color;
        Vector3 translation;
        Matrix4 rotation;
        Matrix4 invRotation;
        double reflectivity;
        double shininess;

    public:
        Sphere(const Vector3& center, double radius, const Vector3& color,
               const Vector3& translation = Vector3(0,0,0),
               const Matrix4& rotation = Matrix4(),
               double reflectivity = 0.3, double shininess = 32);
        ~Sphere() = default;

        bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const override;
};

#endif
