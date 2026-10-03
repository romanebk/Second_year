/*
** EPITECH PROJECT, 2026
** Factory_cpp
** File description:
** implementation of a factory
*/

#include "../../include/Parser/Factory.hpp"
#include "../../include/Primitives/Sphere.hpp"
#include "../../include/Primitives/Cylinder.hpp"
#include "../../include/Primitives/Plane.hpp"
#include "../../include/Primitives/Cone.hpp"
#include "../../include/Lights/AmbientLight.hpp"
#include "../../include/Lights/DirectionalLight.hpp"
#include "../../include/Lights/PointLight.hpp"

std::unique_ptr<IPrimitive> Factory::createSphere(const Vector3& pos, double radius, const Vector3& color, const Vector3& translation, const Vector3& rotation, double reflectivity, double shininess)
{
    Matrix4 rotMatrix = Matrix4::fromEuler(rotation.x, rotation.y, rotation.z);
    return std::make_unique<Sphere>(pos, radius, color, translation, rotMatrix, reflectivity, shininess);
}

std::unique_ptr<IPrimitive> Factory::createPlane(const std::string& axis, double position, const Vector3& color, const Vector3& translation, const Vector3& rotation, double reflectivity, double shininess)
{
    Matrix4 rotMatrix = Matrix4::fromEuler(rotation.x, rotation.y, rotation.z);
    return std::make_unique<Plane>(axis, position, color, translation, rotMatrix, reflectivity, shininess);
}

std::unique_ptr<IPrimitive> Factory::createCylinder(const Vector3& pos, double radius, double height, const Vector3& color, const Vector3& translation, const Vector3& rotation, double reflectivity, double shininess)
{
    Matrix4 rotMatrix = Matrix4::fromEuler(rotation.x, rotation.y, rotation.z);
    return std::make_unique<Cylinder>(pos, radius, height, color, translation, rotMatrix, reflectivity, shininess);
}

std::unique_ptr<IPrimitive> Factory::createCone(const Vector3& pos, double radius, double height, const Vector3& color, const Vector3& translation, const Vector3& rotation, double reflectivity, double shininess)
{
    Matrix4 rotMatrix = Matrix4::fromEuler(rotation.x, rotation.y, rotation.z);
    return std::make_unique<Cone>(pos, radius, height, color, translation, rotMatrix, reflectivity, shininess);
}

std::unique_ptr<ILight> Factory::createAmbientLight(double intensity)
{
    return std::make_unique<AmbientLight>(intensity);
}

std::unique_ptr<ILight> Factory::createDirectionalLight(const Vector3& direction, const Vector3& lightColor, double intensity)
{
    return std::make_unique<DirectionalLight>(direction, lightColor, intensity);
}

std::unique_ptr<ILight> Factory::createPointLight(const Vector3& position, double intensity)
{
    return std::make_unique<PointLight>(position, intensity);
}