/* 
** EPITECH PROJECT, 2026
** SceneBuilder_hpp
** File description:
** header of a Builder
*/

#ifndef SCENEBUILDER_HPP
#define SCENEBUILDER_HPP

#include "../Core/Scene.hpp"
#include <memory>
#include "../Interfaces/ILight.hpp"
#include "../Interfaces/IPrimitive.hpp"
#include "../Core/Camera.hpp"

class SceneBuilder {
    private:
        // Le plateau de montage : la scène en cours de construction
        Scene currentScene;

    public:
        SceneBuilder() = default;

        // 1. Remettre le plateau à zéro (sécurité avant de commencer)
        void reset();

        // 2. Les méthodes pour empiler les Legos sur le plateau
        void setCamera(const Camera& cam);
        void addPrimitive(std::unique_ptr<IPrimitive> prim);
        void addLight(std::unique_ptr<ILight> light);

        // 3. Livrer le produit fini
        // On utilise std::move pour transférer la propriété de la scène 
        // sans copier toute la mémoire (c'est instantané)
        Scene getResult();
        void setDiffuseMultiplier(double diff);
};

#endif