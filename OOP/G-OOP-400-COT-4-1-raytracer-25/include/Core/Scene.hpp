/*
** EPITECH PROJECT, 2026
** Scene_hpp
** File description:
** header of a scene
*/

#ifndef SCENE_HPP_
#define SCENE_HPP_

#include <vector>
#include <memory>
#include "Camera.hpp"
#include "../Interfaces/ILight.hpp"
#include "../Interfaces/IPrimitive.hpp"
#include "Ray.hpp"
#include "HitRecord.hpp"
class Scene {
    private:
        Camera cam;
        std::vector<std::unique_ptr<ILight>> lights;
        std::vector<std::unique_ptr<IPrimitive>> primitives;
        double diffuseMultiplier = 1.0;
    public:
        Scene() = default;
        //Méthodes pour remplir la Scene (Utilisées par le Builder)
        void setCamera(const Camera& camera);
        void addPrimitive(std::unique_ptr<IPrimitive> prim);
        void addLight(std::unique_ptr<ILight> light);

        //Méthode pour le Renderer (Pattern Composite)
        // Parcourt toutes les primitives et renvoie vrai si le rayon touche l'une d'elles.
        // Remplit 'rec' avec les infos de la collision la plus proche.
        bool hitAnything(const Ray& ray, double t_min, double t_max, HitRecord& rec) const;

        // Méthodes pour que le Renderer puisse faire son travail
        const Camera& getCamera() const;
        Camera& getCamera();
        const std::vector<std::unique_ptr<ILight>>& getLights() const;

        //Methodes en rapport avec les multiplicateurs d'éclairage
        void setDiffuseMultiplier(double diff);
        double getDiffuseMultiplier() const;
};

#endif