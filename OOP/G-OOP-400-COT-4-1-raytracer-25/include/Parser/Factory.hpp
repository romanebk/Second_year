/* 
** EPITECH PROJECT, 2026
** Factory_hpp
** File description:
** header of a factory
*/

#ifndef FACTORY_HPP_
#define FACTORY_HPP_

#include <memory>
#include <string>
#include "../Interfaces/ILight.hpp"
#include "../Interfaces/IPrimitive.hpp"
#include "../Math/Vector3.hpp"

class Factory {
    public:
        Factory() = delete;
        ~Factory() = default;

        static std::unique_ptr<IPrimitive> createSphere(const Vector3& pos, double radius, const Vector3& color, const Vector3& translation, const Vector3& rotation, double reflectivity = 0.3, double shininess = 32);
        static std::unique_ptr<IPrimitive> createPlane(const std::string& axis, double position, const Vector3& color, const Vector3& translation, const Vector3& rotation, double reflectivity = 0.1, double shininess = 16);
        static std::unique_ptr<IPrimitive> createCylinder(const Vector3& pos, double radius, double height, const Vector3& color, const Vector3& translation, const Vector3& rotation, double reflectivity = 0.2, double shininess = 32);
        static std::unique_ptr<IPrimitive> createCone(const Vector3& pos, double radius, double height, const Vector3& color, const Vector3& translation, const Vector3& rotation, double reflectivity = 0.2, double shininess = 32);

        static std::unique_ptr<ILight> createAmbientLight(double intensity);
        static std::unique_ptr<ILight> createDirectionalLight(const Vector3& direction, const Vector3& lightColor, double intensity);
        static std::unique_ptr<ILight> createPointLight(const Vector3& position, double intensity);
};

#endif