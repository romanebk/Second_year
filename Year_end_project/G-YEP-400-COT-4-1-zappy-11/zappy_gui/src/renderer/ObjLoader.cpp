#include "ObjLoader.hpp"
#include <fstream>
#include <sstream>
#include <cmath>
#include <cstring>
#include <iostream>
#include <array>
#include <unordered_map>

void ObjModel::upload()
{
    if (uploaded || vertexData.empty()) return;

    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);

    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER,
                 vertexData.size() * sizeof(float),
                 vertexData.data(), GL_STATIC_DRAW);

    const GLsizei stride = 6 * sizeof(float);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, stride, (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, stride, (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);

    glBindVertexArray(0);

    vertexCount = (int)(vertexData.size() / 6);
    uploaded = true;
}

void ObjModel::bindAndDraw() const
{
    if (!uploaded) return;
    glBindVertexArray(vao);
    glDrawArrays(GL_TRIANGLES, 0, vertexCount);
    glBindVertexArray(0);
}

void ObjModel::destroy()
{
    if (instanceVbo) glDeleteBuffers(1, &instanceVbo);
    if (vbo) glDeleteBuffers(1, &vbo);
    if (vao) glDeleteVertexArrays(1, &vao);
    vbo = vao = instanceVbo = 0;
    uploaded = false;
    instancingReady = false;
    instanceCapacity = 0;
}

void ObjModel::setupInstancing()
{
    if (!uploaded || instancingReady) return;

    glBindVertexArray(vao);

    glGenBuffers(1, &instanceVbo);
    glBindBuffer(GL_ARRAY_BUFFER, instanceVbo);

    const GLsizei stride = 19 * sizeof(float);

    for (int col = 0; col < 4; ++col) {
        GLuint loc = 2 + col;
        glVertexAttribPointer(loc, 4, GL_FLOAT, GL_FALSE, stride,
                               (void*)(col * 4 * sizeof(float)));
        glEnableVertexAttribArray(loc);
        glVertexAttribDivisor(loc, 1);
    }

    glVertexAttribPointer(6, 3, GL_FLOAT, GL_FALSE, stride, (void*)(16 * sizeof(float)));
    glEnableVertexAttribArray(6);
    glVertexAttribDivisor(6, 1);

    glBindVertexArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);

    instancingReady = true;
}

void ObjModel::updateInstances(const float *matrices, const float *colors, int count)
{
    if (!instancingReady || count <= 0) return;

    instanceScratch.resize((size_t)count * 19);
    for (int i = 0; i < count; ++i) {
        std::memcpy(&instanceScratch[i * 19], &matrices[i * 16], 16 * sizeof(float));
        std::memcpy(&instanceScratch[i * 19 + 16], &colors[i * 3], 3 * sizeof(float));
    }

    glBindBuffer(GL_ARRAY_BUFFER, instanceVbo);

    if (count > instanceCapacity) {

        instanceCapacity = (int)(count * 1.5f) + 8;
        glBufferData(GL_ARRAY_BUFFER, instanceCapacity * 19 * sizeof(float),
                     nullptr, GL_DYNAMIC_DRAW);
    }

    glBufferSubData(GL_ARRAY_BUFFER, 0,
                     instanceScratch.size() * sizeof(float), instanceScratch.data());
    glBindBuffer(GL_ARRAY_BUFFER, 0);
}

void ObjModel::bindAndDrawInstanced(int count) const
{
    if (!instancingReady || count <= 0) return;
    glBindVertexArray(vao);
    glDrawArraysInstanced(GL_TRIANGLES, 0, vertexCount, count);
    glBindVertexArray(0);
}

void TexturedObjModel::upload()
{
    if (uploaded || vertexData.empty()) return;

    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);

    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER,
                 vertexData.size() * sizeof(float),
                 vertexData.data(), GL_STATIC_DRAW);

    const GLsizei stride = 8 * sizeof(float);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, stride, (void*)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, stride, (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, stride, (void*)(6 * sizeof(float)));
    glEnableVertexAttribArray(2);

    glBindVertexArray(0);

    vertexCount = (int)(vertexData.size() / 8);
    uploaded = true;
}

void TexturedObjModel::bindAndDraw() const
{
    if (!uploaded) return;
    glBindVertexArray(vao);
    glDrawArrays(GL_TRIANGLES, 0, vertexCount);
    glBindVertexArray(0);
}

void TexturedObjModel::destroy()
{
    if (vbo) glDeleteBuffers(1, &vbo);
    if (vao) glDeleteVertexArrays(1, &vao);
    vbo = vao = 0;
    uploaded = false;
}

namespace ObjLoader {

static void parseFaceToken(const std::string &tok, int &posIdx, int &normIdx)
{
    posIdx = normIdx = -1;
    size_t firstSlash = tok.find('/');
    if (firstSlash == std::string::npos) {
        posIdx = std::stoi(tok) - 1;
        return;
    }
    posIdx = std::stoi(tok.substr(0, firstSlash)) - 1;

    size_t secondSlash = tok.find('/', firstSlash + 1);
    if (secondSlash == std::string::npos) {

        return;
    }
    std::string normStr = tok.substr(secondSlash + 1);
    if (!normStr.empty())
        normIdx = std::stoi(normStr) - 1;
}

static void parseFaceTokenFull(const std::string &tok, int &posIdx, int &texIdx, int &normIdx)
{
    posIdx = texIdx = normIdx = -1;
    size_t firstSlash = tok.find('/');
    if (firstSlash == std::string::npos) {
        posIdx = std::stoi(tok) - 1;
        return;
    }
    posIdx = std::stoi(tok.substr(0, firstSlash)) - 1;

    size_t secondSlash = tok.find('/', firstSlash + 1);
    if (secondSlash == std::string::npos) {
        std::string texStr = tok.substr(firstSlash + 1);
        if (!texStr.empty()) texIdx = std::stoi(texStr) - 1;
        return;
    }

    std::string texStr = tok.substr(firstSlash + 1, secondSlash - firstSlash - 1);
    if (!texStr.empty()) texIdx = std::stoi(texStr) - 1;

    std::string normStr = tok.substr(secondSlash + 1);
    if (!normStr.empty()) normIdx = std::stoi(normStr) - 1;
}

bool load(const std::string &path, ObjModel &model)
{
    std::ifstream file(path);
    if (!file) {
        std::cerr << "[ObjLoader] Fichier introuvable : " << path << "\n";
        return false;
    }

    std::vector<std::array<float,3>> positions;
    std::vector<std::array<float,3>> normals;

    struct FaceVert { int p, n; };
    std::vector<std::vector<FaceVert>> faces;

    std::string line;
    while (std::getline(file, line)) {
        if (line.empty() || line[0] == '#') continue;

        std::istringstream ss(line);
        std::string tag;
        ss >> tag;

        if (tag == "v") {
            float x, y, z;
            ss >> x >> y >> z;
            positions.push_back({x, y, z});
        } else if (tag == "vn") {
            float x, y, z;
            ss >> x >> y >> z;
            normals.push_back({x, y, z});
        } else if (tag == "f") {
            std::vector<FaceVert> face;
            std::string tok;
            while (ss >> tok) {
                int p, n;
                parseFaceToken(tok, p, n);
                face.push_back({p, n});
            }
            if (face.size() >= 3)
                faces.push_back(face);
        }

    }

    if (positions.empty() || faces.empty()) {
        std::cerr << "[ObjLoader] Fichier vide ou invalide : " << path << "\n";
        return false;
    }

    bool hasNormals = !normals.empty();

    model.vertexData.clear();
    model.vertexData.reserve(faces.size() * 3 * 6);

    for (auto &face : faces) {
        for (size_t i = 1; i + 1 < face.size(); ++i) {
            const FaceVert *tri[3] = { &face[0], &face[i], &face[i + 1] };

            std::array<float,3> flatNormal{0.f, 1.f, 0.f};
            if (!hasNormals) {
                auto &a = positions[tri[0]->p];
                auto &b = positions[tri[1]->p];
                auto &c = positions[tri[2]->p];
                float ux = b[0]-a[0], uy = b[1]-a[1], uz = b[2]-a[2];
                float vx = c[0]-a[0], vy = c[1]-a[1], vz = c[2]-a[2];
                float nx = uy*vz - uz*vy;
                float ny = uz*vx - ux*vz;
                float nz = ux*vy - uy*vx;
                float len = std::sqrt(nx*nx + ny*ny + nz*nz);
                if (len > 1e-8f) { nx/=len; ny/=len; nz/=len; }
                flatNormal = {nx, ny, nz};
            }

            for (int k = 0; k < 3; ++k) {
                auto &pos = positions[tri[k]->p];
                std::array<float,3> nrm = flatNormal;
                if (hasNormals && tri[k]->n >= 0 && tri[k]->n < (int)normals.size())
                    nrm = normals[tri[k]->n];

                model.vertexData.push_back(pos[0]);
                model.vertexData.push_back(pos[1]);
                model.vertexData.push_back(pos[2]);
                model.vertexData.push_back(nrm[0]);
                model.vertexData.push_back(nrm[1]);
                model.vertexData.push_back(nrm[2]);
            }
        }
    }

    float maxDist = 0.f;
    for (auto &p : positions) {
        float d = std::sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2]);
        if (d > maxDist) maxDist = d;
    }
    model.boundingRadius = (maxDist > 1e-6f) ? maxDist : 1.0f;

    std::cout << "[ObjLoader] Charge : " << path
              << "  (" << positions.size() << " sommets, "
              << model.vertexData.size() / 18 << " triangles, "
              << "rayon=" << model.boundingRadius << ")\n";

    return true;
}

}

namespace ObjLoader {

bool loadTextured(const std::string &path, TexturedObjModel &model)
{
    std::ifstream file(path);
    if (!file) {
        std::cerr << "[ObjLoader] Fichier introuvable : " << path << "\n";
        return false;
    }

    std::vector<std::array<float,3>> positions;
    std::vector<std::array<float,3>> normals;
    std::vector<std::array<float,2>> texcoords;

    struct FaceVert { int p, t, n; };
    std::vector<std::vector<FaceVert>> faces;

    std::string line;
    while (std::getline(file, line)) {
        if (line.empty() || line[0] == '#') continue;

        std::istringstream ss(line);
        std::string tag;
        ss >> tag;

        if (tag == "v") {
            float x, y, z;
            ss >> x >> y >> z;
            positions.push_back({x, y, z});
        } else if (tag == "vt") {
            float u, v;
            ss >> u >> v;
            texcoords.push_back({u, v});
        } else if (tag == "vn") {
            float x, y, z;
            ss >> x >> y >> z;
            normals.push_back({x, y, z});
        } else if (tag == "f") {
            std::vector<FaceVert> face;
            std::string tok;
            while (ss >> tok) {
                int p, t, n;
                parseFaceTokenFull(tok, p, t, n);
                face.push_back({p, t, n});
            }
            if (face.size() >= 3)
                faces.push_back(face);
        }
    }

    if (positions.empty() || faces.empty()) {
        std::cerr << "[ObjLoader] Fichier vide ou invalide : " << path << "\n";
        return false;
    }

    bool hasNormals = !normals.empty();
    bool hasTexcoords = !texcoords.empty();

    model.vertexData.clear();
    model.vertexData.reserve(faces.size() * 3 * 8);

    for (auto &face : faces) {
        for (size_t i = 1; i + 1 < face.size(); ++i) {
            const FaceVert *tri[3] = { &face[0], &face[i], &face[i + 1] };

            std::array<float,3> flatNormal{0.f, 1.f, 0.f};
            if (!hasNormals) {
                auto &a = positions[tri[0]->p];
                auto &b = positions[tri[1]->p];
                auto &c = positions[tri[2]->p];
                float ux = b[0]-a[0], uy = b[1]-a[1], uz = b[2]-a[2];
                float vx = c[0]-a[0], vy = c[1]-a[1], vz = c[2]-a[2];
                float nx = uy*vz - uz*vy;
                float ny = uz*vx - ux*vz;
                float nz = ux*vy - uy*vx;
                float len = std::sqrt(nx*nx + ny*ny + nz*nz);
                if (len > 1e-8f) { nx/=len; ny/=len; nz/=len; }
                flatNormal = {nx, ny, nz};
            }

            for (int k = 0; k < 3; ++k) {
                auto &pos = positions[tri[k]->p];
                std::array<float,3> nrm = flatNormal;
                if (hasNormals && tri[k]->n >= 0 && tri[k]->n < (int)normals.size())
                    nrm = normals[tri[k]->n];

                std::array<float,2> uv{0.f, 0.f};
                if (hasTexcoords && tri[k]->t >= 0 && tri[k]->t < (int)texcoords.size())
                    uv = texcoords[tri[k]->t];

                model.vertexData.push_back(pos[0]);
                model.vertexData.push_back(pos[1]);
                model.vertexData.push_back(pos[2]);
                model.vertexData.push_back(nrm[0]);
                model.vertexData.push_back(nrm[1]);
                model.vertexData.push_back(nrm[2]);
                model.vertexData.push_back(uv[0]);
                model.vertexData.push_back(uv[1]);
            }
        }
    }

    float maxDist = 0.f;
    for (auto &p : positions) {
        float d = std::sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2]);
        if (d > maxDist) maxDist = d;
    }
    model.boundingRadius = (maxDist > 1e-6f) ? maxDist : 1.0f;

    std::cout << "[ObjLoader] Charge (texture) : " << path
              << "  (" << positions.size() << " sommets, "
              << model.vertexData.size() / 24 << " triangles, "
              << "rayon=" << model.boundingRadius << ")\n";

    return true;
}

}
