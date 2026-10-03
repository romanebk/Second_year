/*
** EPITECH PROJECT, 2026
** SceneParser_hpp
** File description:
** header of a scene parser
*/

#ifndef SCENEPARSER_HPP_
#define SCENEPARSER_HPP_

#include <string>
#include "Core/Scene.hpp"

class SceneParser {
    private:
        std::string filePath; // Le chemin vers le fichier .cfg

    public:
        SceneParser(const std::string& path);
        ~SceneParser() = default;

        // La méthode magique : lit le fichier et construit la scène entière
        Scene parse();
};

#endif