/*
** EPITECH PROJECT, 2026
** Cylinder_hpp
** File description:
** header of a cylinder
*/

#ifndef CYLINDER_HPP_
#define CYLINDER_HPP_

#include "../Interfaces/IPrimitive.hpp"
#include "../Math/Vector3.hpp"
#include "../Math/Matrix4.hpp"

class Cylinder : public IPrimitive {
    private:
        Vector3 center;
        double radius;
        double height;
        Vector3 color;
        Vector3 translation;
        Matrix4 rotation;
        Matrix4 invRotation;
        double reflectivity;
        double shininess;

    public:
        Cylinder(const Vector3& center, double radius, double height, const Vector3& color,
                 const Vector3& translation = Vector3(0,0,0),
                 const Matrix4& rotation = Matrix4(),
                 double reflectivity = 0.2, double shininess = 32);
        ~Cylinder() = default;

        bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const override;
};

#endif
