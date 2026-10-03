#pragma once
#include <GL/glew.h>
#include <glm/glm.hpp>
#include <string>
#include <vector>
#include <optional>
#include <cstdint>






#ifndef GPU_MESH_DEFINED
#define GPU_MESH_DEFINED
struct GpuMesh {
    GLuint vao         = 0;
    GLuint vbo         = 0;
    GLuint ebo         = 0;
    int    indexCount  = 0;
    GLuint diffuseTex  = 0;  
    GLuint emissiveTex = 0;  

    void draw() const;
    void destroy();

    GpuMesh() = default;
    GpuMesh(const GpuMesh&)            = delete;
    GpuMesh& operator=(const GpuMesh&) = delete;
    GpuMesh(GpuMesh&&) noexcept;
    GpuMesh& operator=(GpuMesh&&) noexcept;
    ~GpuMesh() { destroy(); }
};
#endif


using GpuModel = std::vector<GpuMesh>;


struct ObjModel;






















class GltfLoader {
public:
    
    static std::optional<GpuMesh> load(const std::string& path);

    
    static GpuModel loadModel(const std::string& path);

    
    
    
    static bool loadIntoObjModel(const std::string& path, ObjModel& out);

private:
    

    struct Accessor {
        int    bufferView = -1;
        int    byteOffset = 0;
        int    componentType = 0; 
        int    count      = 0;
        int    numComponents = 0; 
    };

    struct BufferView {
        int bufferIndex = 0;
        int byteOffset  = 0;
        int byteLength  = 0;
        int byteStride  = 0; 
    };

    struct Primitive {
        int posAccessor  = -1;
        int normAccessor = -1;
        int uvAccessor   = -1;
        int idxAccessor  = -1;
        int material     = -1;
        glm::mat4 transform = glm::mat4(1.0f); 
    };

    struct Image {
        int         bufferView = -1;
        std::string mime;
    };

    struct Material {
        int diffuseTex  = -1; 
        int emissiveTex = -1; 
    };

    struct ParseResult {
        std::vector<uint8_t>    bin;         
        std::vector<Accessor>   accessors;
        std::vector<BufferView> bufferViews;
        std::vector<Primitive>  primitives;
        std::vector<Image>      images;
        std::vector<int>        textureSource; 
        std::vector<Material>   materials;
    };

    
    static bool parseGlb (const std::string& path, ParseResult& out);
    static bool parseGltf(const std::string& path, ParseResult& out);

    
    
    
    static bool parseJson(const std::string& json,
                          const std::string& binDir,
                          ParseResult& out);

    
    
    template<typename T>
    static bool readAccessor(const ParseResult& pr, int accIdx,
                              std::vector<T>& dst);

    
    static GpuMesh upload(std::vector<float>& verts,
                           std::vector<uint32_t>& indices);

    
    static std::vector<uint8_t> decodeBase64(const std::string& b64);

    
    static int  jsonInt (const std::string& j, size_t pos);
    static std::string jsonStr(const std::string& j, size_t pos);

    
    static size_t jsonFind(const std::string& j, size_t start,
                            size_t end, const std::string& key);

    
    static bool jsonArrayElem(const std::string& j,
                               size_t arrStart, size_t arrEnd,
                               int n,
                               size_t& elemStart, size_t& elemEnd);

    
    static bool jsonArrayOf(const std::string& j, size_t objStart, size_t objEnd,
                             const std::string& key,
                             size_t& arrStart, size_t& arrEnd);
};
