/*
** EPITECH PROJECT, 2026
** Plane_hpp
** File description:
** header of a plane
*/

#ifndef PLANE_HPP_
#define PLANE_HPP_

#include "../Interfaces/IPrimitive.hpp"
#include "../Math/Vector3.hpp"
#include "../Math/Matrix4.hpp"
#include <string>

class Plane : public IPrimitive {
    private:
        std::string axis;
        double position;
        Vector3 color;
        Vector3 translation;
        Matrix4 rotation;
        Matrix4 invRotation;
        double reflectivity;
        double shininess;

    public:
        Plane(const std::string& axis, double position, const Vector3& color,
              const Vector3& translation = Vector3(0,0,0),
              const Matrix4& rotation = Matrix4(),
              double reflectivity = 0.1, double shininess = 16);
        ~Plane() = default;

        bool hit(const Ray& ray, double t_min, double t_max, HitRecord& rec) const override;
};

#endif
