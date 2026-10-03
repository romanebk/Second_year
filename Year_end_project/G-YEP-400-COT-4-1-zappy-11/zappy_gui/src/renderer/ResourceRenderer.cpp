#include "ResourceRenderer.hpp"
#include "GltfLoader.hpp"
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
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

const char* ResourceRenderer::RES_NAMES[7] = {
    "food", "linemate", "deraumere", "sibur", "mendiane", "phiras", "thystame"
};

void ResourceRenderer::buildFallbackSphere(int stacks, int slices)
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

void ResourceRenderer::init()
{
    if (_ready) return;

    buildFallbackSphere(16, 16);

    
    
    static const char* GLB_PATHS[7] = {
        "assets/models/apple.glb",                       
        "assets/models/tiny_geode.glb",                  
        "assets/models/crystal_spider.glb",              
        "assets/models/magic_orb.glb",                   
        "assets/models/low_poly_canyondesert_block.glb", 
        "assets/models/crystal_spider.glb",              
        "assets/models/magic_orb.glb",                   
    };

    for (int i = 0; i < 7; ++i) {
        bool loaded = GltfLoader::loadIntoObjModel(GLB_PATHS[i], _models[i]);
        if (!loaded) {
            
            std::string objPath = std::string("assets/minerals/") + RES_NAMES[i] + ".obj";
            loaded = ObjLoader::load(objPath, _models[i]);
        }
        
        
        static constexpr int MAX_INSTANCE_VERTS = 10000;
        if (loaded && _models[i].vertexCount > MAX_INSTANCE_VERTS) {
            std::cerr << "[ResourceRenderer] Modele trop dense pour l'instancing ("
                      << _models[i].vertexCount << " sommets) : "
                      << RES_NAMES[i] << " -> sphere generique\n";
            _models[i].destroy();
            loaded = false;
        }
        if (loaded) {
            _models[i].upload();
            _models[i].setupInstancing();
            _modelLoaded[i] = true;
        } else {
            std::cerr << "[ResourceRenderer] Repli sur sphere generique pour : "
                      << RES_NAMES[i] << "\n";
            _modelLoaded[i] = false;
        }
    }

    _ready = true;
    std::cout << "[ResourceRenderer] Initialise (modeles .glb assets/models + replis).\n";
}

void ResourceRenderer::drawOne(Shader &shader, Mineral mineral,
                                const glm::mat4 &model) const
{
    if (!_ready) return;

    int idx = static_cast<int>(mineral);
    if (idx < 0 || idx >= 7) return;

    shader.setMat4("model",     model);
    shader.setVec3("glowColor", RES_COLOR[idx]);

    if (_modelLoaded[idx]) {
        _models[idx].bindAndDraw();
    } else {
        glBindVertexArray(_sphereVAO);
        glDrawElements(GL_TRIANGLES, _sphereIndexCount, GL_UNSIGNED_INT, 0);
        glBindVertexArray(0);
    }
}

void ResourceRenderer::beginBatch()
{
    for (auto &b : _batches) b.clear();
}

void ResourceRenderer::addInstance(Mineral mineral, const glm::mat4 &model)
{
    int idx = static_cast<int>(mineral);
    if (idx < 0 || idx >= 7) return;

    if (!_modelLoaded[idx]) return;

    const float *mp = glm::value_ptr(model);
    auto &batch = _batches[idx];
    batch.matrices.insert(batch.matrices.end(), mp, mp + 16);
    batch.colors.push_back(RES_COLOR[idx].r);
    batch.colors.push_back(RES_COLOR[idx].g);
    batch.colors.push_back(RES_COLOR[idx].b);
    ++batch.count;
}

void ResourceRenderer::flush(Shader &shader)
{
    if (!_ready) return;
    (void)shader;

    for (int i = 0; i < 7; ++i) {
        auto &batch = _batches[i];
        if (batch.count == 0 || !_modelLoaded[i]) continue;

        _models[i].updateInstances(batch.matrices.data(), batch.colors.data(), batch.count);
        _models[i].bindAndDrawInstanced(batch.count);
    }
}

float ResourceRenderer::boundingRadius(Mineral mineral) const
{
    int idx = static_cast<int>(mineral);
    if (idx < 0 || idx >= 7) return 1.0f;
    return _modelLoaded[idx] ? _models[idx].boundingRadius : 1.0f;
}

glm::vec3 ResourceRenderer::color(Mineral mineral)
{
    int idx = static_cast<int>(mineral);
    if (idx < 0 || idx >= 7) return glm::vec3(1.0f);
    return RES_COLOR[idx];
}

ResourceRenderer::~ResourceRenderer()
{
    if (_sphereEBO) glDeleteBuffers(1, &_sphereEBO);
    if (_sphereVBO) glDeleteBuffers(1, &_sphereVBO);
    if (_sphereVAO) glDeleteVertexArrays(1, &_sphereVAO);

    for (auto &m : _models) m.destroy();
}
