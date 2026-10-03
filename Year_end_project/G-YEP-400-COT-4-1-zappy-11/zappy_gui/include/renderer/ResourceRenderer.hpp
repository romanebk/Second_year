#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <vector>
#include "Shader.hpp"
#include "Camera.hpp"
#include "ObjLoader.hpp"

class ResourceRenderer {
public:
    enum class Mineral {
        Food, Linemate, Deraumere, Sibur, Mendiane, Phiras, Thystame,
        Count
    };

    ResourceRenderer() = default;
    ~ResourceRenderer();

    void init();

    void drawOne(Shader &shader, Mineral mineral, const glm::mat4 &model) const;

    void beginBatch();

    void addInstance(Mineral mineral, const glm::mat4 &model);

    void flush(Shader &shader);

    float boundingRadius(Mineral mineral) const;
    static glm::vec3 color(Mineral mineral);

    static constexpr float TARGET_RADIUS = 0.16f;

private:
    void buildFallbackSphere(int stacks, int slices);

    GLuint _sphereVAO = 0, _sphereVBO = 0, _sphereEBO = 0;
    int    _sphereIndexCount = 0;

    bool _ready = false;

    ObjModel _models[7];
    bool     _modelLoaded[7] = { false, false, false, false, false, false, false };

    struct Batch {
        std::vector<float> matrices;
        std::vector<float> colors;
        int count = 0;
        void clear() { matrices.clear(); colors.clear(); count = 0; }
    };
    Batch _batches[7];

    static const glm::vec3 RES_COLOR[7];
    static const char*     RES_NAMES[7];
};
