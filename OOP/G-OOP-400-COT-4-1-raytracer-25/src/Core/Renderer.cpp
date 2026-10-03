/*
** EPITECH PROJECT, 2026
** Renderer_cpp
** File description:
** implementation of a renderer
*/

#include "../../include/Core/Renderer.hpp"
#include <algorithm>

Renderer::Renderer(Scene& scene, int maxDepth, int sqrtSamples)
    : _scene(scene), _width(scene.getCamera().getWidth()), _height(scene.getCamera().getHeight()),
      _maxDepth(maxDepth), _sqrtSamples(sqrtSamples)
{
    _pixels.resize(_width * _height);
}

Vector3 Renderer::traceRay(const Ray& ray, int depth)
{
    if (depth <= 0)
        return Vector3(0, 0, 0);

    HitRecord record;
    if (_scene.hitAnything(ray, 0.001, 1e9, record)) {
        record.viewDir = (-ray.direction).normalized();

        Vector3 color(0, 0, 0);
        for (const auto& light : _scene.getLights()) {
            color = color + light->computeImpactLight(record, _scene);
        }

        if (record.reflectivity > 0.0) {
            Vector3 reflectDir = ray.direction - record.normal * 2.0 * ray.direction.dot(record.normal);
            reflectDir.normalize();
            Vector3 reflectOrigin = record.point + record.normal * 0.001;
            Ray reflectRay(reflectOrigin, reflectDir);
            color = color + traceRay(reflectRay, depth - 1) * record.reflectivity;
        }

        return color;
    }
    return Vector3(0, 0, 0);
}

static void renderBand(Scene& scene, std::vector<Vector3>& pixels,
    int width, int startY, int endY, int sqrtSamples, int maxDepth, Renderer* renderer)
{
    int totalSamples = sqrtSamples * sqrtSamples;

    for (int y = startY; y < endY; y++) {
        for (int x = 0; x < width; x++) {
            Vector3 accumulated(0, 0, 0);

            for (int sy = 0; sy < sqrtSamples; sy++) {
                for (int sx = 0; sx < sqrtSamples; sx++) {
                    double px = x + (sx + 0.5) / sqrtSamples;
                    double py = y + (sy + 0.5) / sqrtSamples;

                    Ray ray = scene.getCamera().getRay(px, py);

                    accumulated = accumulated + renderer->traceRay(ray, maxDepth);
                }
            }

            Vector3 color = accumulated / static_cast<double>(totalSamples);

            color.x = std::clamp(color.x, 0.0, 255.0);
            color.y = std::clamp(color.y, 0.0, 255.0);
            color.z = std::clamp(color.z, 0.0, 255.0);

            pixels[y * width + x] = color;
        }
    }
}

void Renderer::render()
{
    int numThreads = 4;
    std::vector<std::thread> threads;
    int bandHeight = _height / numThreads;

    for (int i = 0; i < numThreads; i++) {
        int startY = i * bandHeight;
        int endY   = (i == numThreads - 1) ? _height : startY + bandHeight;
        threads.emplace_back(renderBand,
            std::ref(_scene),
            std::ref(_pixels),
            _width, startY, endY,
            _sqrtSamples, _maxDepth, this
        );
    }

    for (auto& thread : threads) {
        if (thread.joinable()) {
            thread.join();
        }
    }

    threads.clear();
}

void Renderer::saveAsPPM(const std::string& filename)
{
    std::ofstream file(filename);

    file << "P3\n";
    file << _width << " " << _height << "\n";
    file << "255\n";

    for (int y = 0; y < _height; y++) {
        for (int x = 0; x < _width; x++) {
            Vector3& c = _pixels[y * _width + x];
            file << static_cast<int>(c.x) << " "
                 << static_cast<int>(c.y) << " "
                 << static_cast<int>(c.z) << "\n";
        }
    }

    file.close();
}
