#include "renderer/ResourceRenderer.hpp"
#include <glm/gtc/matrix_transform.hpp>
#include <cmath>
#include <vector>
#include <iostream>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif





const glm::vec3 ResourceRenderer::RES_COLOR[7] = {
    {0.95f, 0.80f, 0.15f},   
    {0.75f, 0.75f, 0.80f},   
    {0.15f, 0.55f, 0.95f},   
    {0.95f, 0.40f, 0.10f},   
    {0.75f, 0.15f, 0.85f},   
    {0.15f, 0.90f, 0.45f},   
    {0.95f, 0.10f, 0.25f},   
};


std::vector<float> ResourceRenderer::circleAngles(int n)
{
    std::vector<float> angles;
    angles.reserve(n);
    for (int i = 0; i < n; ++i)
        angles.push_back((float)(2.0 * M_PI * i / n) - (float)(M_PI / 2.0));
    return angles;
}




void ResourceRenderer::buildSphere(int stacks, int slices)
{
    std::vector<float>    verts;
    std::vector<unsigned> idx;

    for (int i = 0; i <= stacks; ++i) {
        float phi  = (float)M_PI * i / stacks;       
        float sinP = sinf(phi), cosP = cosf(phi);

        for (int j = 0; j <= slices; ++j) {
            float theta = 2.f * (float)M_PI * j / slices;
            float sinT = sinf(theta), cosT = cosf(theta);

            float nx = sinP * cosT;
            float ny = cosP;
            float nz = sinP * sinT;

            
            verts.push_back(nx); verts.push_back(ny); verts.push_back(nz);
            verts.push_back(nx); verts.push_back(ny); verts.push_back(nz);
        }
    }

    for (int i = 0; i < stacks; ++i) {
        for (int j = 0; j < slices; ++j) {
            unsigned a = i * (slices + 1) + j;
            unsigned b = a + slices + 1;
            idx.push_back(a);   idx.push_back(b);   idx.push_back(a + 1);
            idx.push_back(b);   idx.push_back(b + 1); idx.push_back(a + 1);
        }
    }
    _sphereIndexCount = (int)idx.size();

    glGenVertexArrays(1, &_sphereVAO);
    glBindVertexArray(_sphereVAO);

    glGenBuffers(1, &_sphereVBO);
    glBindBuffer(GL_ARRAY_BUFFER, _sphereVBO);
    glBufferData(GL_ARRAY_BUFFER,
                 verts.size() * sizeof(float), verts.data(), GL_STATIC_DRAW);

    glGenBuffers(1, &_sphereEBO);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, _sphereEBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER,
                 idx.size() * sizeof(unsigned), idx.data(), GL_STATIC_DRAW);

    const GLsizei stride = 6 * sizeof(float);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, stride, (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, stride, (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);

    glBindVertexArray(0);
}





void ResourceRenderer::buildQuad()
{
    
    static const float Q[] = {
        -1.f, -1.f,
         1.f, -1.f,
        -1.f,  1.f,
         1.f,  1.f,
    };

    glGenVertexArrays(1, &_quadVAO);
    glBindVertexArray(_quadVAO);

    glGenBuffers(1, &_quadVBO);
    glBindBuffer(GL_ARRAY_BUFFER, _quadVBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(Q), Q, GL_STATIC_DRAW);

    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    glBindVertexArray(0);
}


void ResourceRenderer::init()
{
    if (_ready) return;
    buildSphere(16, 16);
    buildQuad();
    _ready = true;
    std::cout << "[ResourceRenderer] Sphere + quad billboard initialises.\n";
}




void ResourceRenderer::draw(Shader &sphereShader, Shader &glowShader,
                             const GameState &state, const Camera &camera,
                             float aspect)
{
    if (!_ready || state.mapWidth == 0) return;

    const float offsetX = -(state.mapWidth  - 1) * 0.5f * TILE_SIZE;
    const float offsetZ = -(state.mapHeight - 1) * 0.5f * TILE_SIZE;

    glm::mat4 view = camera.getView();
    glm::mat4 proj = camera.getProjection(aspect);

    
    glm::vec3 camRight(view[0][0], view[1][0], view[2][0]);
    glm::vec3 camUp   (view[0][1], view[1][1], view[2][1]);

    
    sphereShader.use();
    sphereShader.setMat4("view",       view);
    sphereShader.setMat4("projection", proj);

    glBindVertexArray(_sphereVAO);

    for (auto &[coord, tile] : state.tiles) {
        float cx = offsetX + coord.first  * TILE_SIZE;
        float cz = offsetZ + coord.second * TILE_SIZE;

        
        const int counts[7] = {
            tile.resources.food,      tile.resources.linemate,
            tile.resources.deraumere, tile.resources.sibur,
            tile.resources.mendiane,  tile.resources.phiras,
            tile.resources.thystame
        };

        
        std::vector<int> present;
        present.reserve(7);
        for (int i = 0; i < 7; ++i)
            if (counts[i] > 0) present.push_back(i);

        if (present.empty()) continue;

        auto angles = circleAngles((int)present.size());

        for (int k = 0; k < (int)present.size(); ++k) {
            int   ri  = present[k];
            float ang = angles[k];

            float bx = cx + RING_R * cosf(ang);
            float bz = cz + RING_R * sinf(ang);
            float by = BOL_HEIGHT;

            glm::mat4 model = glm::translate(glm::mat4(1.f), {bx, by, bz});
            model = glm::scale(model, glm::vec3(SPHERE_R));

            sphereShader.setMat4("model",     model);
            sphereShader.setVec3("glowColor", RES_COLOR[ri]);

            glDrawElements(GL_TRIANGLES, _sphereIndexCount, GL_UNSIGNED_INT, 0);
        }
    }
    glBindVertexArray(0);

    
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE);   
    glDepthMask(GL_FALSE);               

    glowShader.use();
    glowShader.setMat4("view",       view);
    glowShader.setMat4("projection", proj);

    glBindVertexArray(_quadVAO);

    for (auto &[coord, tile] : state.tiles) {
        float cx = offsetX + coord.first  * TILE_SIZE;
        float cz = offsetZ + coord.second * TILE_SIZE;

        const int counts[7] = {
            tile.resources.food,      tile.resources.linemate,
            tile.resources.deraumere, tile.resources.sibur,
            tile.resources.mendiane,  tile.resources.phiras,
            tile.resources.thystame
        };

        std::vector<int> present;
        for (int i = 0; i < 7; ++i)
            if (counts[i] > 0) present.push_back(i);

        if (present.empty()) continue;

        auto angles = circleAngles((int)present.size());

        for (int k = 0; k < (int)present.size(); ++k) {
            int   ri  = present[k];
            float ang = angles[k];

            float bx = offsetX + coord.first  * TILE_SIZE + RING_R * cosf(ang);
            float bz = offsetZ + coord.second * TILE_SIZE + RING_R * sinf(ang);
            float by = BOL_HEIGHT;

            glm::vec3 center(bx, by, bz);

            
            
            glm::mat4 model = glm::mat4(1.f);
            model[0] = glm::vec4(camRight * GLOW_SIZE, 0.f);
            model[1] = glm::vec4(camUp    * GLOW_SIZE, 0.f);
            model[2] = glm::vec4(glm::cross(camRight, camUp), 0.f);
            model[3] = glm::vec4(center, 1.f);

            glowShader.setMat4("model",     model);
            glowShader.setVec3("glowColor", RES_COLOR[ri]);

            glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
        }
    }

    glBindVertexArray(0);
    glDepthMask(GL_TRUE);
    glDisable(GL_BLEND);
}


ResourceRenderer::~ResourceRenderer()
{
    if (_sphereEBO) glDeleteBuffers(1, &_sphereEBO);
    if (_sphereVBO) glDeleteBuffers(1, &_sphereVBO);
    if (_sphereVAO) glDeleteVertexArrays(1, &_sphereVAO);
    if (_quadVBO)   glDeleteBuffers(1, &_quadVBO);
    if (_quadVAO)   glDeleteVertexArrays(1, &_quadVAO);
}
