#pragma once

#include <glm/glm.hpp>
#include <array>

class Frustum {
public:

    void update(const glm::mat4 &viewProjection);

    bool sphereInFrustum(const glm::vec3 &center, float radius) const;

private:

    std::array<glm::vec4, 6> _planes;
};
