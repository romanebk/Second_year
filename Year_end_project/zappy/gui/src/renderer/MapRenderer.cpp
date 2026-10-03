#include "renderer/MapRenderer.hpp"
#include <glm/gtc/matrix_transform.hpp>
#include <iostream>


#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"







static const float TILE_VERTICES[] = {
    
    
    -0.5f,-0.5f, 0.5f,   0.f, 0.f, 1.f,   0.f,0.f,
     0.5f,-0.5f, 0.5f,   0.f, 0.f, 1.f,   1.f,0.f,
     0.5f, 0.5f, 0.5f,   0.f, 0.f, 1.f,   1.f,1.f,
     0.5f, 0.5f, 0.5f,   0.f, 0.f, 1.f,   1.f,1.f,
    -0.5f, 0.5f, 0.5f,   0.f, 0.f, 1.f,   0.f,1.f,
    -0.5f,-0.5f, 0.5f,   0.f, 0.f, 1.f,   0.f,0.f,
    
     0.5f,-0.5f,-0.5f,   0.f, 0.f,-1.f,   0.f,0.f,
    -0.5f,-0.5f,-0.5f,   0.f, 0.f,-1.f,   1.f,0.f,
    -0.5f, 0.5f,-0.5f,   0.f, 0.f,-1.f,   1.f,1.f,
    -0.5f, 0.5f,-0.5f,   0.f, 0.f,-1.f,   1.f,1.f,
     0.5f, 0.5f,-0.5f,   0.f, 0.f,-1.f,   0.f,1.f,
     0.5f,-0.5f,-0.5f,   0.f, 0.f,-1.f,   0.f,0.f,
    
    -0.5f,-0.5f,-0.5f,  -1.f, 0.f, 0.f,   0.f,0.f,
    -0.5f,-0.5f, 0.5f,  -1.f, 0.f, 0.f,   1.f,0.f,
    -0.5f, 0.5f, 0.5f,  -1.f, 0.f, 0.f,   1.f,1.f,
    -0.5f, 0.5f, 0.5f,  -1.f, 0.f, 0.f,   1.f,1.f,
    -0.5f, 0.5f,-0.5f,  -1.f, 0.f, 0.f,   0.f,1.f,
    -0.5f,-0.5f,-0.5f,  -1.f, 0.f, 0.f,   0.f,0.f,
    
     0.5f,-0.5f, 0.5f,   1.f, 0.f, 0.f,   0.f,0.f,
     0.5f,-0.5f,-0.5f,   1.f, 0.f, 0.f,   1.f,0.f,
     0.5f, 0.5f,-0.5f,   1.f, 0.f, 0.f,   1.f,1.f,
     0.5f, 0.5f,-0.5f,   1.f, 0.f, 0.f,   1.f,1.f,
     0.5f, 0.5f, 0.5f,   1.f, 0.f, 0.f,   0.f,1.f,
     0.5f,-0.5f, 0.5f,   1.f, 0.f, 0.f,   0.f,0.f,
    
    -0.5f, 0.5f, 0.5f,   0.f, 1.f, 0.f,   0.f,0.f,
     0.5f, 0.5f, 0.5f,   0.f, 1.f, 0.f,   1.f,0.f,
     0.5f, 0.5f,-0.5f,   0.f, 1.f, 0.f,   1.f,1.f,
     0.5f, 0.5f,-0.5f,   0.f, 1.f, 0.f,   1.f,1.f,
    -0.5f, 0.5f,-0.5f,   0.f, 1.f, 0.f,   0.f,1.f,
    -0.5f, 0.5f, 0.5f,   0.f, 1.f, 0.f,   0.f,0.f,
    
    -0.5f,-0.5f,-0.5f,   0.f,-1.f, 0.f,   0.f,0.f,
     0.5f,-0.5f,-0.5f,   0.f,-1.f, 0.f,   1.f,0.f,
     0.5f,-0.5f, 0.5f,   0.f,-1.f, 0.f,   1.f,1.f,
     0.5f,-0.5f, 0.5f,   0.f,-1.f, 0.f,   1.f,1.f,
    -0.5f,-0.5f, 0.5f,   0.f,-1.f, 0.f,   0.f,1.f,
    -0.5f,-0.5f,-0.5f,   0.f,-1.f, 0.f,   0.f,0.f,
};
static constexpr int VERTEX_COUNT = 36;


bool MapRenderer::loadTexture(const std::string &path)
{
    stbi_set_flip_vertically_on_load(true);
    int w, h, channels;
    unsigned char *data = stbi_load(path.c_str(), &w, &h, &channels, 0);
    if (!data) {
        std::cerr << "[MapRenderer] Impossible de charger : " << path
                  << "  (" << stbi_failure_reason() << ")\n";
        return false;
    }

    GLenum fmt = (channels == 4) ? GL_RGBA : GL_RGB;

    glGenTextures(1, &_texture);
    glBindTexture(GL_TEXTURE_2D, _texture);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

    glTexImage2D(GL_TEXTURE_2D, 0, (GLint)fmt, w, h, 0, fmt, GL_UNSIGNED_BYTE, data);
    glGenerateMipmap(GL_TEXTURE_2D);

    glPixelStorei(GL_UNPACK_ALIGNMENT, 4);
    
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S,     GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T,     GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

    glBindTexture(GL_TEXTURE_2D, 0);
    stbi_image_free(data);

    std::cout << "[MapRenderer] Texture chargee : " << path
              << "  (" << w << "x" << h << ", " << channels << "ch)\n";
    return true;
}


void MapRenderer::init(ThemeMode theme)
{
    if (_ready) return;

    
    std::string texPath = themeTexturePath(theme);
    if (!loadTexture(texPath)) {
        
        glGenTextures(1, &_texture);
        glBindTexture(GL_TEXTURE_2D, _texture);
        unsigned char fallback[16] = {
            200,200,200,255,  120,120,120,255,
            120,120,120,255,  200,200,200,255
        };
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 2, 2, 0,
                     GL_RGBA, GL_UNSIGNED_BYTE, fallback);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        glBindTexture(GL_TEXTURE_2D, 0);
        std::cerr << "[MapRenderer] Utilisation de la texture de remplacement.\n";
    }

    
    glGenVertexArrays(1, &_vao);
    glBindVertexArray(_vao);

    glGenBuffers(1, &_vbo);
    glBindBuffer(GL_ARRAY_BUFFER, _vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(TILE_VERTICES), TILE_VERTICES, GL_STATIC_DRAW);

    const GLsizei stride = 8 * sizeof(float);

    
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, stride, (void*)0);
    glEnableVertexAttribArray(0);

    
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, stride, (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);

    
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, stride, (void*)(6 * sizeof(float)));
    glEnableVertexAttribArray(2);

    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindVertexArray(0);

    _ready = true;
    std::cout << "[MapRenderer] Cube initialise (" << VERTEX_COUNT << " vertices).\n";
}


void MapRenderer::draw(Shader &shader, const GameState &state)
{
    if (!_ready || state.mapWidth == 0 || state.mapHeight == 0) return;

    const float offsetX = -(state.mapWidth  - 1) * 0.5f * TILE_SIZE;
    const float offsetZ = -(state.mapHeight - 1) * 0.5f * TILE_SIZE;

    
    glActiveTexture(GL_TEXTURE0);
    glBindTexture(GL_TEXTURE_2D, _texture);
    shader.setInt("floorTexture", 0);

    glBindVertexArray(_vao);

    for (int row = 0; row < state.mapHeight; ++row) {
        for (int col = 0; col < state.mapWidth; ++col) {

            glm::mat4 model = glm::translate(
                glm::mat4(1.f),
                glm::vec3(offsetX + col * TILE_SIZE, 0.f, offsetZ + row * TILE_SIZE)
            );
            shader.setMat4("model", model);
            shader.setFloat("highlight", 0.f);

            glDrawArrays(GL_TRIANGLES, 0, VERTEX_COUNT);
        }
    }

    glBindVertexArray(0);
    glBindTexture(GL_TEXTURE_2D, 0);
}


MapRenderer::~MapRenderer()
{
    if (_texture) glDeleteTextures(1, &_texture);
    if (_vbo)     glDeleteBuffers(1, &_vbo);
    if (_vao)     glDeleteVertexArrays(1, &_vao);
}
