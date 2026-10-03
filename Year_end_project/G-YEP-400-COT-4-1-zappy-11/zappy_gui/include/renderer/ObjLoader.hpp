#pragma once

#include <GL/glew.h>
#include <string>
#include <vector>

struct ObjModel {

    std::vector<float> vertexData;

    GLuint vao = 0;
    GLuint vbo = 0;
    int    vertexCount = 0;
    bool   uploaded = false;

    GLuint instanceVbo = 0;
    int    instanceCapacity = 0;
    bool   instancingReady = false;
    std::vector<float> instanceScratch;

    float boundingRadius = 1.0f;

    void upload();
    void bindAndDraw() const;
    void destroy();

    void setupInstancing();

    void updateInstances(const float *matrices, const float *colors, int count);

    void bindAndDrawInstanced(int count) const;
};

struct TexturedObjModel {
    std::vector<float> vertexData;

    GLuint vao = 0;
    GLuint vbo = 0;
    int    vertexCount = 0;
    bool   uploaded = false;

    float boundingRadius = 1.0f;

    void upload();
    void bindAndDraw() const;
    void destroy();
};

namespace ObjLoader {

    bool load(const std::string &path, ObjModel &model);

    bool loadTextured(const std::string &path, TexturedObjModel &model);
}
