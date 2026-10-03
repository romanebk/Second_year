#include "renderer/Shader.hpp"
#include <glm/gtc/type_ptr.hpp>
#include <fstream>
#include <sstream>
#include <iostream>
#include <stdexcept>


Shader::Shader(const std::string &vertPath, const std::string &fragPath)
{
    GLuint vert = compileStage(vertPath, GL_VERTEX_SHADER);
    GLuint frag = compileStage(fragPath, GL_FRAGMENT_SHADER);

    _program = glCreateProgram();
    glAttachShader(_program, vert);
    glAttachShader(_program, frag);
    glLinkProgram(_program);
    checkLink(_program);

    glDeleteShader(vert);
    glDeleteShader(frag);
}

Shader::~Shader()
{
    if (_program) glDeleteProgram(_program);
}


void Shader::use() const { glUseProgram(_program); }

void Shader::setInt(const std::string &n, int v) const {
    glUniform1i(glGetUniformLocation(_program, n.c_str()), v);
}
void Shader::setFloat(const std::string &n, float v) const {
    glUniform1f(glGetUniformLocation(_program, n.c_str()), v);
}
void Shader::setVec3(const std::string &n, const glm::vec3 &v) const {
    glUniform3fv(glGetUniformLocation(_program, n.c_str()), 1, glm::value_ptr(v));
}
void Shader::setVec4(const std::string &n, const glm::vec4 &v) const {
    glUniform4fv(glGetUniformLocation(_program, n.c_str()), 1, glm::value_ptr(v));
}
void Shader::setMat4(const std::string &n, const glm::mat4 &v) const {
    glUniformMatrix4fv(glGetUniformLocation(_program, n.c_str()), 1, GL_FALSE, glm::value_ptr(v));
}


GLuint Shader::compileStage(const std::string &path, GLenum type)
{
    std::string src  = readFile(path);
    const char *cstr = src.c_str();

    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, &cstr, nullptr);
    glCompileShader(shader);
    checkCompile(shader, path);
    return shader;
}


std::string Shader::readFile(const std::string &path)
{
    std::ifstream f(path);
    if (!f.is_open())
        throw std::runtime_error("[Shader] impossible d'ouvrir : " + path);
    std::ostringstream ss;
    ss << f.rdbuf();
    return ss.str();
}


void Shader::checkCompile(GLuint shader, const std::string &path)
{
    GLint ok = 0;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &ok);
    if (!ok) {
        char log[1024];
        glGetShaderInfoLog(shader, sizeof(log), nullptr, log);
        throw std::runtime_error("[Shader] compilation '" + path + "' :\n" + log);
    }
}

void Shader::checkLink(GLuint program)
{
    GLint ok = 0;
    glGetProgramiv(program, GL_LINK_STATUS, &ok);
    if (!ok) {
        char log[1024];
        glGetProgramInfoLog(program, sizeof(log), nullptr, log);
        throw std::runtime_error(std::string("[Shader] link : ") + log);
    }
}