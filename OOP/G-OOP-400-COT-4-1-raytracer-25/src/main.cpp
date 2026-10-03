/* 
** EPITECH PROJECT, 2026
** Raytracer_cpp
** File description:
** main file for the raytracer
*/

#include "../include/Parser/SceneParser.hpp"
#include "../include/Core/Renderer.hpp"
#include "../include/Core/Scene.hpp"
#include <iostream>
#include <stdexcept>

int main(int argc, char** argv)
{
    if (argc != 2) {
        std::cerr << "USAGE: ./raytracer <SCENE_FILE>" << std::endl;
        return 84;
    }
    try {
        SceneParser parser(argv[1]);
        Scene scene = parser.parse();

        scene.getCamera().init();

        //std::cout << "Rendu en cours... (ça peut prendre quelques secondes)" << std::endl;
        Renderer renderer(scene);
        renderer.render();

        std::string outputFile = "screenshot.ppm";
        renderer.saveAsPPM(outputFile);
        //std::cout << "Succès ! Image sauvegardée dans " << outputFile << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Erreur : " << e.what() << std::endl;
        return 84;
    }
}