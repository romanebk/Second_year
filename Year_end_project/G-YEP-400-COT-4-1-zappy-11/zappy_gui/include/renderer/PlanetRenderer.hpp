#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <string>
#include "Shader.hpp"
#include "Camera.hpp"
#include "ObjLoader.hpp"

class PlanetRenderer {
public:
    static constexpr int PLANET_COUNT = 6;

    PlanetRenderer() = default;
    ~PlanetRenderer();

    void init();
    void draw(Shader &shader, const Camera &camera, float aspect, float dt);

private:
    struct Planet {
        TexturedObjModel model;
        GLuint  texture = 0;
        bool    textureLoaded = false;
        glm::vec3 fallbackColor { 0.6f, 0.6f, 0.6f };
        glm::vec3 position { 0.f, 0.f, 0.f };
        float     scale = 1.f;
        float     rotationSpeed = 0.f;
        float     currentRotation = 0.f;

        bool      hasRing = false;
        TexturedObjModel ringModel;
        GLuint    ringTexture = 0;
        bool      ringTextureLoaded = false;
        glm::vec3 ringFallbackColor { 0.6f, 0.55f, 0.45f };
    };

    bool loadTexture(const std::string &path, GLuint &outTex);
    glm::vec3 readMtlColor(const std::string &mtlPath, const glm::vec3 &fallback);
    void loadPlanet(int idx, const std::string &objName, const std::string &texName,
                    const glm::vec3 &position, float scale, float rotationSpeed);
    void loadRingFor(int idx, const std::string &ringObjName, const std::string &texName);

    Planet _planets[PLANET_COUNT];
    bool   _ready = false;
};
