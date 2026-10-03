#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <vector>
#include "Shader.hpp"
#include "Camera.hpp"

class StarfieldRenderer {
public:
    StarfieldRenderer() = default;
    ~StarfieldRenderer();

    void init(int count, float radius, int shootingMax = 4);

    void update(float dt);

    void draw(Shader &starShader, Shader &shootingShader,
              const Camera &camera, float aspect);

private:
    struct ShootingStar {
        glm::vec3 start { 0.f };
        glm::vec3 end   { 0.f };
        float     progress = 1.f;
        float     speed    = 1.f;
        float     delay    = 0.f;
    };

    void respawnShootingStar(ShootingStar &s, float radius);
    void buildShootingStarGeometry();

    GLuint _vao = 0, _vbo = 0;
    int    _starCount = 0;
    bool   _ready = false;
    float  _time = 0.f;

    GLuint _shootVao = 0, _shootVbo = 0;
    std::vector<ShootingStar> _shootingStars;
    float _fieldRadius = 200.f;
};
