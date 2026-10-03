#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <vector>
#include "state/GameState.hpp"
#include "renderer/Shader.hpp"
#include "renderer/Camera.hpp"











class ResourceRenderer {
public:
    ResourceRenderer() = default;
    ~ResourceRenderer();

    void init();

    
    
    void draw(Shader &sphereShader, Shader &glowShader,
              const GameState &state, const Camera &camera,
              float aspect);

    
    static constexpr float TILE_SIZE   = 1.0f;
    static constexpr float SPHERE_R    = 0.10f;   
    static constexpr float BOL_HEIGHT  = 0.65f;   
    static constexpr float RING_R      = 0.28f;   
    static constexpr float GLOW_SIZE   = 0.32f;   

private:
    
    void buildSphere(int stacks, int slices);

    
    void buildQuad();

    
    GLuint _sphereVAO = 0, _sphereVBO = 0, _sphereEBO = 0;
    int    _sphereIndexCount = 0;

    GLuint _quadVAO = 0, _quadVBO = 0;

    bool _ready = false;

    
    
    static const glm::vec3 RES_COLOR[7];

    
    
    static std::vector<float> circleAngles(int n);
};
