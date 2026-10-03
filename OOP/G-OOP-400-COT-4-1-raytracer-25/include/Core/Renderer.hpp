/*
** EPITECH PROJECT, 2026
** Renderer_hpp
** File description:
** header of the renderer
*/

#ifndef RENDERER_HPP_
#define RENDERER_HPP_

#include <string>
#include <vector>
#include <fstream>
#include <iostream>
#include <thread>
#include <algorithm>
#include "./Scene.hpp"
#include "./Camera.hpp"
#include "./Ray.hpp"
#include "./HitRecord.hpp"
#include "../Math/Vector3.hpp"

class Renderer {
    public:
        Renderer(Scene& scene, int maxDepth = 5, int sqrtSamples = 2);
        ~Renderer() = default;

        void render();
        void saveAsPPM(const std::string& filename);
        Vector3 traceRay(const Ray& ray, int depth);

    private:
        Scene& _scene;
        int _width;
        int _height;
        int _maxDepth;
        int _sqrtSamples;
        std::vector<Vector3> _pixels;
};

#endif