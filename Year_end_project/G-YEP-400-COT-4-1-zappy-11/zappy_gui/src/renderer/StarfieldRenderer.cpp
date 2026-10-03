#include "StarfieldRenderer.hpp"
#include <glm/gtc/matrix_transform.hpp>
#include <cmath>
#include <random>
#include <iostream>

static std::mt19937 g_starRng(20260627u);

void StarfieldRenderer::init(int count, float radius, int shootingMax)
{
    if (_ready) return;
    _fieldRadius = radius;

    std::uniform_real_distribution<float> distU(0.f, 1.f);

    std::vector<float> verts;
    verts.reserve(count * 6);

    for (int i = 0; i < count; ++i) {
        float u = distU(g_starRng);
        float v = distU(g_starRng);
        float theta = 2.f * 3.14159265f * u;
        float phi   = acosf(2.f * v - 1.f);

        float x = radius * sinf(phi) * cosf(theta);
        float y = radius * cosf(phi);
        float z = radius * sinf(phi) * sinf(theta);

        float size       = 1.5f + distU(g_starRng) * 2.5f;
        float brightness = 0.5f + distU(g_starRng) * 0.5f;
        float phase       = distU(g_starRng) * 6.2831853f;

        verts.push_back(x);
        verts.push_back(y);
        verts.push_back(z);
        verts.push_back(size);
        verts.push_back(brightness);
        verts.push_back(phase);
    }
    _starCount = count;

    glGenVertexArrays(1, &_vao);
    glBindVertexArray(_vao);

    glGenBuffers(1, &_vbo);
    glBindBuffer(GL_ARRAY_BUFFER, _vbo);
    glBufferData(GL_ARRAY_BUFFER, verts.size() * sizeof(float), verts.data(), GL_STATIC_DRAW);

    const GLsizei stride = 6 * sizeof(float);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, stride, (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 1, GL_FLOAT, GL_FALSE, stride, (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(2, 1, GL_FLOAT, GL_FALSE, stride, (void*)(4 * sizeof(float)));
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(3, 1, GL_FLOAT, GL_FALSE, stride, (void*)(5 * sizeof(float)));
    glEnableVertexAttribArray(3);

    glBindVertexArray(0);

    _shootingStars.resize(shootingMax);
    for (auto &s : _shootingStars) {
        s.progress = 1.f;
        s.delay = std::uniform_real_distribution<float>(0.5f, 4.f)(g_starRng);
    }
    buildShootingStarGeometry();

    _ready = true;
    std::cout << "[StarfieldRenderer] " << count << " etoiles scintillantes + "
              << shootingMax << " filantes max (rayon=" << radius << ").\n";
}

void StarfieldRenderer::buildShootingStarGeometry()
{
    glGenVertexArrays(1, &_shootVao);
    glBindVertexArray(_shootVao);

    glGenBuffers(1, &_shootVbo);
    glBindBuffer(GL_ARRAY_BUFFER, _shootVbo);
    glBufferData(GL_ARRAY_BUFFER,
                 _shootingStars.size() * 2 * 4 * sizeof(float),
                 nullptr, GL_DYNAMIC_DRAW);

    const GLsizei stride = 4 * sizeof(float);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, stride, (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 1, GL_FLOAT, GL_FALSE, stride, (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);

    glBindVertexArray(0);
}

void StarfieldRenderer::respawnShootingStar(ShootingStar &s, float radius)
{
    std::uniform_real_distribution<float> distAngle(0.f, 6.2831853f);
    std::uniform_real_distribution<float> distElev(-0.6f, 0.9f);
    std::uniform_real_distribution<float> distLen(0.08f, 0.22f);
    std::uniform_real_distribution<float> distSpeed(0.6f, 1.4f);

    float theta = distAngle(g_starRng);
    float elev  = distElev(g_starRng);
    float phi   = acosf(std::max(-1.f, std::min(1.f, elev)));

    glm::vec3 dir(sinf(phi) * cosf(theta), cosf(phi), sinf(phi) * sinf(theta));

    glm::vec3 arbitrary = (fabsf(dir.y) < 0.95f) ? glm::vec3(0.f, 1.f, 0.f) : glm::vec3(1.f, 0.f, 0.f);
    glm::vec3 tangent = glm::normalize(glm::cross(dir, arbitrary));

    std::uniform_real_distribution<float> distMix(-1.f, 1.f);
    tangent = glm::normalize(tangent + arbitrary * distMix(g_starRng) * 0.4f);

    float len = distLen(g_starRng) * radius;

    s.start    = dir * radius;
    s.end      = s.start + tangent * len;
    s.progress = 0.f;
    s.speed    = distSpeed(g_starRng);
    s.delay    = 0.f;
}

void StarfieldRenderer::update(float dt)
{
    if (!_ready) return;
    _time += dt;

    std::vector<float> buf(_shootingStars.size() * 2 * 4, 0.f);

    for (size_t i = 0; i < _shootingStars.size(); ++i) {
        auto &s = _shootingStars[i];

        if (s.progress >= 1.f) {
            s.delay -= dt;
            if (s.delay <= 0.f)
                respawnShootingStar(s, _fieldRadius);
            continue;
        }

        s.progress += dt * s.speed;
        float alpha = (s.progress < 1.f) ? sinf(s.progress * 3.14159265f) : 0.f;

        if (s.progress >= 1.f) {
            s.progress = 1.f;
            std::uniform_real_distribution<float> distDelay(1.5f, 6.f);
            s.delay = distDelay(g_starRng);
            alpha = 0.f;
        }

        glm::vec3 pos = glm::mix(s.start, s.end, std::min(s.progress, 1.f));

        size_t base = i * 8;
        buf[base + 0] = pos.x;
        buf[base + 1] = pos.y;
        buf[base + 2] = pos.z;
        buf[base + 3] = alpha;
        glm::vec3 tail = glm::mix(s.start, s.end, std::max(0.f, std::min(s.progress, 1.f) - 0.04f));
        buf[base + 4] = tail.x;
        buf[base + 5] = tail.y;
        buf[base + 6] = tail.z;
        buf[base + 7] = alpha * 0.3f;
    }

    glBindBuffer(GL_ARRAY_BUFFER, _shootVbo);
    glBufferSubData(GL_ARRAY_BUFFER, 0, buf.size() * sizeof(float), buf.data());
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

void StarfieldRenderer::draw(Shader &starShader, Shader &shootingShader,
                              const Camera &camera, float aspect)
{
    if (!_ready) return;

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE);
    glDepthMask(GL_FALSE);

    GLboolean cullWasEnabled = glIsEnabled(GL_CULL_FACE);
    if (cullWasEnabled) glDisable(GL_CULL_FACE);

    glm::mat4 view = camera.getView();
    glm::mat4 viewNoTranslation = glm::mat4(glm::mat3(view));
    glm::mat4 proj = camera.getProjection(aspect);

    glEnable(GL_PROGRAM_POINT_SIZE);
    starShader.use();
    starShader.setMat4("view",       viewNoTranslation);
    starShader.setMat4("projection", proj);
    starShader.setFloat("time", _time);

    glBindVertexArray(_vao);
    glDrawArrays(GL_POINTS, 0, _starCount);
    glBindVertexArray(0);

    shootingShader.use();
    shootingShader.setMat4("view",       viewNoTranslation);
    shootingShader.setMat4("projection", proj);

    glBindVertexArray(_shootVao);
    glLineWidth(2.f);
    glDrawArrays(GL_LINES, 0, (GLsizei)(_shootingStars.size() * 2));
    glBindVertexArray(0);

    glDisable(GL_PROGRAM_POINT_SIZE);
    if (cullWasEnabled) glEnable(GL_CULL_FACE);
    glDepthMask(GL_TRUE);
    glDisable(GL_BLEND);
}

StarfieldRenderer::~StarfieldRenderer()
{
    if (_vbo) glDeleteBuffers(1, &_vbo);
    if (_vao) glDeleteVertexArrays(1, &_vao);
    if (_shootVbo) glDeleteBuffers(1, &_shootVbo);
    if (_shootVao) glDeleteVertexArrays(1, &_shootVao);
}
