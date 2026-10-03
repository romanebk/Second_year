/* 
** EPITECH PROJECT, 2026
** Scene_cpp
** File description:
** implementation of a scene
*/
#include "../../include/Core/Scene.hpp"

void Scene::setCamera(const Camera& camera)
{
    cam = camera;
}

void Scene::addPrimitive(std::unique_ptr<IPrimitive> prim)
{
    primitives.push_back(std::move(prim));
}

void Scene::addLight(std::unique_ptr<ILight> light)
{
    lights.push_back(std::move(light));
}

bool Scene::hitAnything(const Ray& ray, double t_min, double t_max, HitRecord& rec) const {
    HitRecord temp_rec;       // Pour stocker temporairement la collision en cours
    bool hit_anything = false; // On n'a encore rien touché
    auto closest_so_far = t_max; // La distance la plus courte trouvée jusqu'ici (on commence à la limite du rayon)

    // On parcourt toutes les primitives de la scène
    for (const auto& primitive : primitives) {
        // On demande à la primitive si le rayon la touche
        // Attention : on remplace t_max par closest_so_far ! 
        // On ne s'intéresse qu'aux collisions plus proches que la dernière trouvée.
        if (primitive->hit(ray, t_min, closest_so_far, temp_rec)) {
            hit_anything = true;            // On a touché quelque chose !
            closest_so_far = temp_rec.t;    // On met à jour la distance limite
            rec = temp_rec;                 // On sauvegarde les infos de cette collision
        }
    }

    return hit_anything;
}
const Camera& Scene::getCamera() const
{
    return cam;
}

Camera& Scene::getCamera()
{
    return cam;
}

const std::vector<std::unique_ptr<ILight>>& Scene::getLights() const
{
    return lights;
}

void Scene::setDiffuseMultiplier(double diff)
{
    diffuseMultiplier = diff;
}

double Scene::getDiffuseMultiplier() const
{
    return diffuseMultiplier;
}