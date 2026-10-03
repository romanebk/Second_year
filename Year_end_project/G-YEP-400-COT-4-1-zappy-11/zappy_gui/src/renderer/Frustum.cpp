#include "Frustum.hpp"
#include <cmath>

void Frustum::update(const glm::mat4 &m)
{

    _planes[0] = glm::vec4(m[0][3] + m[0][0], m[1][3] + m[1][0], m[2][3] + m[2][0], m[3][3] + m[3][0]);
    _planes[1] = glm::vec4(m[0][3] - m[0][0], m[1][3] - m[1][0], m[2][3] - m[2][0], m[3][3] - m[3][0]);
    _planes[2] = glm::vec4(m[0][3] + m[0][1], m[1][3] + m[1][1], m[2][3] + m[2][1], m[3][3] + m[3][1]);
    _planes[3] = glm::vec4(m[0][3] - m[0][1], m[1][3] - m[1][1], m[2][3] - m[2][1], m[3][3] - m[3][1]);
    _planes[4] = glm::vec4(m[0][3] + m[0][2], m[1][3] + m[1][2], m[2][3] + m[2][2], m[3][3] + m[3][2]);
    _planes[5] = glm::vec4(m[0][3] - m[0][2], m[1][3] - m[1][2], m[2][3] - m[2][2], m[3][3] - m[3][2]);

    for (auto &p : _planes) {
        float len = std::sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        if (len > 1e-6f) p /= len;
    }
}

bool Frustum::sphereInFrustum(const glm::vec3 &center, float radius) const
{
    for (const auto &p : _planes) {
        float distance = p.x * center.x + p.y * center.y + p.z * center.z + p.w;
        if (distance < -radius)
            return false;
    }
    return true;
}
