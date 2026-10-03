#include "PlanetRenderer.hpp"
#include <glm/gtc/matrix_transform.hpp>
#include <fstream>
#include <sstream>
#include <iostream>

#if defined(__GNUC__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wimplicit-fallthrough"
#endif
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"
#if defined(__GNUC__)
#pragma GCC diagnostic pop
#endif

glm::vec3 PlanetRenderer::readMtlColor(const std::string &mtlPath, const glm::vec3 &fallback)
{
    std::ifstream file(mtlPath);
    if (!file) return fallback;

    std::string line;
    while (std::getline(file, line)) {
        std::istringstream ss(line);
        std::string tag;
        ss >> tag;
        if (tag == "Kd") {
            float r, g, b;
            ss >> r >> g >> b;
            return glm::vec3(r, g, b);
        }
    }
    return fallback;
}

bool PlanetRenderer::loadTexture(const std::string &path, GLuint &outTex)
{
    stbi_set_flip_vertically_on_load(true);
    int w, h, channels;
    unsigned char *data = stbi_load(path.c_str(), &w, &h, &channels, 0);
    if (!data) {
        std::cerr << "[PlanetRenderer] Texture introuvable : " << path << "\n";
        return false;
    }

    GLenum fmt = (channels == 4) ? GL_RGBA : GL_RGB;

    glGenTextures(1, &outTex);
    glBindTexture(GL_TEXTURE_2D, outTex);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glTexImage2D(GL_TEXTURE_2D, 0, (GLint)fmt, w, h, 0, fmt, GL_UNSIGNED_BYTE, data);
    glGenerateMipmap(GL_TEXTURE_2D);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S,     GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T,     GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 4);
    glBindTexture(GL_TEXTURE_2D, 0);

    stbi_image_free(data);
    std::cout << "[PlanetRenderer] Texture chargee : " << path
              << " (" << w << "x" << h << ")\n";
    return true;
}

void PlanetRenderer::loadPlanet(int idx, const std::string &objName, const std::string &texName,
                                 const glm::vec3 &position, float scale, float rotationSpeed)
{
    Planet &p = _planets[idx];

    std::string objPath = "assets/planets/" + objName + ".obj";
    std::string mtlPath = "assets/planets/" + objName + ".mtl";
    std::string texPath = "assets/planets/" + texName + ".png";

    if (ObjLoader::loadTextured(objPath, p.model))
        p.model.upload();
    p.fallbackColor = readMtlColor(mtlPath, p.fallbackColor);
    p.textureLoaded = loadTexture(texPath, p.texture);

    p.position       = position;
    p.scale          = scale;
    p.rotationSpeed  = rotationSpeed;
}

void PlanetRenderer::loadRingFor(int idx, const std::string &ringObjName, const std::string &texName)
{
    Planet &p = _planets[idx];

    std::string objPath = "assets/planets/" + ringObjName + ".obj";
    std::string mtlPath = "assets/planets/" + ringObjName + ".mtl";
    std::string texPath = "assets/planets/" + texName + ".png";

    if (ObjLoader::loadTextured(objPath, p.ringModel))
        p.ringModel.upload();
    p.ringFallbackColor = readMtlColor(mtlPath, p.ringFallbackColor);
    p.ringTextureLoaded = loadTexture(texPath, p.ringTexture);
    p.hasRing = true;
}

void PlanetRenderer::init()
{
    if (_ready) return;

    loadPlanet(0, "planet_1", "planet_1", glm::vec3(-14.f, 4.f, -22.f), 2.6f, 0.025f);

    loadPlanet(1, "planet_2", "planet_2", glm::vec3(20.f, -2.f, -30.f), 3.4f, 0.018f);
    loadRingFor(1, "planet_2_ring", "planet_2");

    loadPlanet(2, "planet_3", "planet_3", glm::vec3(2.f, 7.f, -35.f), 2.2f, 0.04f);

    loadPlanet(3, "planet_4", "planet_4", glm::vec3(16.f, 5.f, 26.f), 2.0f, 0.03f);

    loadPlanet(4, "planet_5", "planet_5", glm::vec3(-22.f, -3.f, 32.f), 3.0f, 0.02f);
    loadRingFor(4, "planet_5_ring", "planet_5");

    loadPlanet(5, "planet_6", "planet_6", glm::vec3(-3.f, 8.f, 38.f), 2.4f, 0.022f);

    _ready = true;
    std::cout << "[PlanetRenderer] " << PLANET_COUNT << " planetes initialisees.\n";
}

void PlanetRenderer::draw(Shader &shader, const Camera &camera, float aspect, float dt)
{
    if (!_ready) return;

    shader.use();
    shader.setMat4("view",       camera.getView());
    shader.setMat4("projection", camera.getProjection(aspect));

    for (auto &p : _planets) {
        if (!p.model.uploaded) continue;

        p.currentRotation += p.rotationSpeed * dt;

        glm::mat4 model = glm::translate(glm::mat4(1.f), p.position);
        model = glm::rotate(model, p.currentRotation, glm::vec3(0.f, 1.f, 0.f));
        model = glm::scale(model, glm::vec3(p.scale));

        shader.setMat4("model", model);

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, p.texture);
        shader.setInt("planetTexture", 0);

        p.model.bindAndDraw();
    }

    GLboolean cullWasEnabled = glIsEnabled(GL_CULL_FACE);
    if (cullWasEnabled) glDisable(GL_CULL_FACE);

    for (auto &p : _planets) {
        if (!p.hasRing || !p.ringModel.uploaded) continue;

        glm::mat4 model = glm::translate(glm::mat4(1.f), p.position);
        model = glm::rotate(model, glm::radians(20.f), glm::vec3(0.f, 0.f, 1.f));
        model = glm::scale(model, glm::vec3(p.scale));

        shader.setMat4("model", model);

        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, p.ringTexture);
        shader.setInt("planetTexture", 0);

        p.ringModel.bindAndDraw();
    }

    if (cullWasEnabled) glEnable(GL_CULL_FACE);
    glBindTexture(GL_TEXTURE_2D, 0);
}

PlanetRenderer::~PlanetRenderer()
{
    for (auto &p : _planets) {
        p.model.destroy();
        if (p.texture) glDeleteTextures(1, &p.texture);
        if (p.hasRing) {
            p.ringModel.destroy();
            if (p.ringTexture) glDeleteTextures(1, &p.ringTexture);
        }
    }
}
