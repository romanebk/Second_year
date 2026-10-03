#pragma once
#include <GL/glew.h>
#include <glm/glm.hpp>
#include "state/GameState.hpp"
#include "core/ThemeMode.hpp"
#include "renderer/Shader.hpp"








class MapRenderer {
public:
    MapRenderer() = default;
    ~MapRenderer();

    
    void init(ThemeMode theme);

    
    void draw(Shader &shader, const GameState &state);

    static constexpr float TILE_SIZE = 1.0f;

private:
    GLuint _vao     = 0;
    GLuint _vbo     = 0;
    GLuint _texture = 0;
    bool   _ready   = false;

    bool loadTexture(const std::string &path);
};
