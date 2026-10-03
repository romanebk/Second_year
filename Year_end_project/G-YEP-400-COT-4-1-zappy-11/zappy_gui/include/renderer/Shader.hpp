#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <string>

class Shader {
public:
    Shader(const std::string &vertPath, const std::string &fragPath);
    ~Shader();

    void use() const;

    void setInt  (const std::string &name, int v)              const;
    void setFloat(const std::string &name, float v)            const;
    void setVec3 (const std::string &name, const glm::vec3 &v) const;
    void setVec4 (const std::string &name, const glm::vec4 &v) const;
    void setMat4 (const std::string &name, const glm::mat4 &v) const;

    GLuint id() const { return _program; }

private:
    GLuint _program = 0;

    static GLuint   compileStage(const std::string &path, GLenum type);
    static std::string readFile(const std::string &path);
    static void     checkCompile(GLuint shader, const std::string &path);
    static void     checkLink   (GLuint program);
};