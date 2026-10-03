/* 
** EPITECH PROJECT, 2026
** Factory_hpp
** File description:
** implementation of a builder
*/

#include "../../include/Parser/SceneBuilder.hpp"
#include <utility>

void SceneBuilder::reset()
{
    currentScene = Scene();
}

void SceneBuilder::setCamera(const Camera& cam)
{
    currentScene.setCamera(cam);
}

void SceneBuilder::addPrimitive(std::unique_ptr<IPrimitive> prim)
{
    currentScene.addPrimitive(std::move(prim));
}

void SceneBuilder::addLight(std::unique_ptr<ILight> light)
{
    currentScene.addLight(std::move(light));
}

Scene SceneBuilder::getResult()
{
    Scene result = std::move(currentScene);
    reset();
    return result;
}

void SceneBuilder::setDiffuseMultiplier(double diff)
{
    currentScene.setDiffuseMultiplier(diff);
}