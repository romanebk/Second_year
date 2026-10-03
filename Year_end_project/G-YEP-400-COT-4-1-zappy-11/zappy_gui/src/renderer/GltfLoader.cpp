#include "GltfLoader.hpp"
#include "ObjLoader.hpp"

#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <cstring>
#include <cstdlib>
#include <cmath>
#include <stdexcept>
#include <map>
#include <limits>
#include <glm/gtc/type_ptr.hpp>
#include <glm/gtc/quaternion.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "stb_image.h" 




#ifndef GPU_MESH_IMPL
#define GPU_MESH_IMPL

GpuMesh::GpuMesh(GpuMesh&& o) noexcept
    : vao(o.vao), vbo(o.vbo), ebo(o.ebo), indexCount(o.indexCount),
      diffuseTex(o.diffuseTex), emissiveTex(o.emissiveTex)
{ o.vao = o.vbo = o.ebo = 0; o.indexCount = 0; o.diffuseTex = o.emissiveTex = 0; }

GpuMesh& GpuMesh::operator=(GpuMesh&& o) noexcept {
    if (this != &o) { destroy(); vao=o.vao; vbo=o.vbo; ebo=o.ebo;
        indexCount=o.indexCount; diffuseTex=o.diffuseTex; emissiveTex=o.emissiveTex;
        o.vao=o.vbo=o.ebo=0; o.indexCount=0; o.diffuseTex=o.emissiveTex=0; }
    return *this;
}
void GpuMesh::draw() const {
    if (!vao||indexCount==0) return;
    glBindVertexArray(vao);
    glDrawElements(GL_TRIANGLES,indexCount,GL_UNSIGNED_INT,nullptr);
    glBindVertexArray(0);
}
void GpuMesh::destroy() {
    if(emissiveTex){glDeleteTextures(1,&emissiveTex);emissiveTex=0;}
    if(diffuseTex){glDeleteTextures(1,&diffuseTex);diffuseTex=0;}
    if(ebo){glDeleteBuffers(1,&ebo);ebo=0;}
    if(vbo){glDeleteBuffers(1,&vbo);vbo=0;}
    if(vao){glDeleteVertexArrays(1,&vao);vao=0;}
    indexCount=0;
}
#endif




static std::vector<uint8_t> readFile(const std::string& path) {
    std::ifstream f(path, std::ios::binary|std::ios::ate);
    if (!f) return {};
    auto sz = f.tellg(); f.seekg(0);
    std::vector<uint8_t> buf((size_t)sz);
    f.read(reinterpret_cast<char*>(buf.data()), sz);
    return buf;
}




static const std::string B64_CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

std::vector<uint8_t> GltfLoader::decodeBase64(const std::string& in) {
    std::vector<uint8_t> out;
    int val=0, bits=-8;
    for (unsigned char c : in) {
        auto pos = B64_CHARS.find(c);
        if (pos == std::string::npos) { if(c=='=') break; continue; }
        val = (val<<6) | (int)pos;
        bits += 6;
        if (bits >= 0) {
            out.push_back((uint8_t)((val>>bits)&0xFF));
            bits -= 8;
        }
    }
    return out;
}







static size_t skipWs(const std::string& j, size_t p) {
    while (p < j.size() && (j[p]==' '||j[p]=='\t'||j[p]=='\n'||j[p]=='\r')) ++p;
    return p;
}


static size_t skipValue(const std::string& j, size_t p);

static size_t skipObject(const std::string& j, size_t p) {
    
    ++p; int depth=1;
    while (p<j.size()&&depth>0) {
        if (j[p]=='{') ++depth;
        else if (j[p]=='}') --depth;
        else if (j[p]=='"') { ++p; while(p<j.size()&&j[p]!='"'){if(j[p]=='\\')++p;++p;} }
        ++p;
    }
    return p;
}

static size_t skipArray(const std::string& j, size_t p) {
    ++p; int depth=1;
    while (p<j.size()&&depth>0) {
        if (j[p]=='[') ++depth;
        else if (j[p]==']') --depth;
        else if (j[p]=='"') { ++p; while(p<j.size()&&j[p]!='"'){if(j[p]=='\\')++p;++p;} }
        ++p;
    }
    return p;
}

static size_t skipString(const std::string& j, size_t p) {
    ++p; 
    while (p<j.size()&&j[p]!='"'){if(j[p]=='\\')++p;++p;}
    return p+1; 
}

static size_t skipValue(const std::string& j, size_t p) {
    p = skipWs(j,p);
    if (p>=j.size()) return p;
    if (j[p]=='{') return skipObject(j,p);
    if (j[p]=='[') return skipArray(j,p);
    if (j[p]=='"') return skipString(j,p);
    
    while (p<j.size()&&j[p]!=','&&j[p]!='}'&&j[p]!=']'&&j[p]!='\n') ++p;
    return p;
}


size_t GltfLoader::jsonFind(const std::string& j, size_t start, size_t end,
                             const std::string& key) {
    std::string needle = "\"" + key + "\"";
    size_t p = start;
    while (p < end) {
        size_t found = j.find(needle, p);
        if (found == std::string::npos || found >= end) return std::string::npos;
        size_t after = found + needle.size();
        after = skipWs(j, after);
        if (after < end && j[after] == ':') return after + 1;
        p = found + 1;
    }
    return std::string::npos;
}

int GltfLoader::jsonInt(const std::string& j, size_t p) {
    p = skipWs(j,p);
    int sign = 1;
    if (p<j.size()&&j[p]=='-'){sign=-1;++p;}
    int val = 0;
    while (p<j.size()&&j[p]>='0'&&j[p]<='9') val=val*10+(j[p++]-'0');
    return sign*val;
}

std::string GltfLoader::jsonStr(const std::string& j, size_t p) {
    p = skipWs(j,p);
    if (p>=j.size()||j[p]!='"') return "";
    ++p;
    std::string out;
    while (p<j.size()&&j[p]!='"') {
        if (j[p]=='\\'){++p; if(p<j.size())out+=j[p++];}
        else out+=j[p++];
    }
    return out;
}


bool GltfLoader::jsonArrayOf(const std::string& j, size_t objStart, size_t objEnd,
                              const std::string& key,
                              size_t& arrStart, size_t& arrEnd) {
    size_t pos = jsonFind(j, objStart, objEnd, key);
    if (pos == std::string::npos) return false;
    pos = skipWs(j, pos);
    if (pos >= objEnd || j[pos] != '[') return false;
    arrStart = pos;
    arrEnd   = skipArray(j, pos);
    return true;
}


bool GltfLoader::jsonArrayElem(const std::string& j,
                                size_t arrStart, size_t arrEnd,
                                int n,
                                size_t& elemStart, size_t& elemEnd) {
    size_t p = arrStart + 1; 
    for (int i = 0; ; ++i) {
        p = skipWs(j, p);
        if (p >= arrEnd || j[p] == ']') return false;
        size_t eStart = p;
        size_t eEnd   = skipValue(j, p);
        if (i == n) { elemStart=eStart; elemEnd=eEnd; return true; }
        p = skipWs(j, eEnd);
        if (p < arrEnd && j[p] == ',') ++p;
    }
}





static std::vector<float> jsonFloatArray(const std::string& j, size_t pos) {
    std::vector<float> v;
    pos = skipWs(j, pos);
    if (pos >= j.size() || j[pos] != '[') return v;
    ++pos;
    while (true) {
        pos = skipWs(j, pos);
        if (pos >= j.size() || j[pos] == ']') break;
        size_t start = pos;
        while (pos < j.size() && j[pos] != ',' && j[pos] != ']') ++pos;
        v.push_back(std::strtof(j.substr(start, pos - start).c_str(), nullptr));
        pos = skipWs(j, pos);
        if (pos < j.size() && j[pos] == ',') ++pos;
    }
    return v;
}

static std::vector<int> jsonIntArray(const std::string& j, size_t pos) {
    std::vector<int> v;
    pos = skipWs(j, pos);
    if (pos >= j.size() || j[pos] != '[') return v;
    ++pos;
    while (true) {
        pos = skipWs(j, pos);
        if (pos >= j.size() || j[pos] == ']') break;
        size_t start = pos;
        while (pos < j.size() && j[pos] != ',' && j[pos] != ']') ++pos;
        v.push_back(std::atoi(j.substr(start, pos - start).c_str()));
        pos = skipWs(j, pos);
        if (pos < j.size() && j[pos] == ',') ++pos;
    }
    return v;
}




static int typeComponents(const std::string& t) {
    if (t=="SCALAR") return 1;
    if (t=="VEC2")   return 2;
    if (t=="VEC3")   return 3;
    if (t=="VEC4")   return 4;
    if (t=="MAT2")   return 4;
    if (t=="MAT3")   return 9;
    if (t=="MAT4")   return 16;
    return 1;
}




bool GltfLoader::parseJson(const std::string& json,
                            const std::string& binDir,
                            ParseResult& out)
{
    size_t root = 0, rootEnd = json.size();

    
    size_t bufsStart, bufsEnd;
    if (out.bin.empty() &&
        jsonArrayOf(json, root, rootEnd, "buffers", bufsStart, bufsEnd))
    {
        size_t es, ee;
        if (jsonArrayElem(json, bufsStart, bufsEnd, 0, es, ee)) {
            size_t uriPos = jsonFind(json, es, ee, "uri");
            if (uriPos != std::string::npos) {
                std::string uri = jsonStr(json, uriPos);
                if (uri.rfind("data:", 0) == 0) {
                    
                    auto comma = uri.find(',');
                    if (comma != std::string::npos)
                        out.bin = decodeBase64(uri.substr(comma+1));
                } else {
                    
                    std::string binPath = binDir.empty()
                        ? uri : (binDir + "/" + uri);
                    out.bin = readFile(binPath);
                }
            }
        }
    }

    
    size_t bvStart, bvEnd;
    if (!jsonArrayOf(json, root, rootEnd, "bufferViews", bvStart, bvEnd)) {
        std::cerr << "[GltfLoader] Pas de bufferViews\n"; return false;
    }
    for (int i = 0; ; ++i) {
        size_t es, ee;
        if (!jsonArrayElem(json, bvStart, bvEnd, i, es, ee)) break;
        BufferView bv;
        size_t p;
        p = jsonFind(json,es,ee,"buffer");    if(p!=std::string::npos) bv.bufferIndex=jsonInt(json,p);
        p = jsonFind(json,es,ee,"byteOffset");if(p!=std::string::npos) bv.byteOffset =jsonInt(json,p);
        p = jsonFind(json,es,ee,"byteLength");if(p!=std::string::npos) bv.byteLength =jsonInt(json,p);
        p = jsonFind(json,es,ee,"byteStride");if(p!=std::string::npos) bv.byteStride =jsonInt(json,p);
        out.bufferViews.push_back(bv);
    }

    
    size_t accStart, accEnd;
    if (!jsonArrayOf(json, root, rootEnd, "accessors", accStart, accEnd)) {
        std::cerr << "[GltfLoader] Pas d'accessors\n"; return false;
    }
    for (int i = 0; ; ++i) {
        size_t es, ee;
        if (!jsonArrayElem(json, accStart, accEnd, i, es, ee)) break;
        Accessor a;
        size_t p;
        p = jsonFind(json,es,ee,"bufferView");   if(p!=std::string::npos) a.bufferView    =jsonInt(json,p);
        p = jsonFind(json,es,ee,"byteOffset");   if(p!=std::string::npos) a.byteOffset    =jsonInt(json,p);
        p = jsonFind(json,es,ee,"componentType");if(p!=std::string::npos) a.componentType =jsonInt(json,p);
        p = jsonFind(json,es,ee,"count");        if(p!=std::string::npos) a.count         =jsonInt(json,p);
        p = jsonFind(json,es,ee,"type");
        if(p!=std::string::npos) a.numComponents = typeComponents(jsonStr(json,p));
        out.accessors.push_back(a);
    }

    
    
    
    
    struct GltfNode {
        glm::mat4        local = glm::mat4(1.0f);
        int              mesh  = -1;
        std::vector<int> children;
    };
    std::vector<GltfNode> nodes;
    {
        size_t nodesStart, nodesEnd;
        if (jsonArrayOf(json, root, rootEnd, "nodes", nodesStart, nodesEnd)) {
            for (int i = 0; ; ++i) {
                size_t es, ee;
                if (!jsonArrayElem(json, nodesStart, nodesEnd, i, es, ee)) break;
                GltfNode n;
                size_t p;
                p = jsonFind(json, es, ee, "mesh");
                if (p != std::string::npos) n.mesh = jsonInt(json, p);

                p = jsonFind(json, es, ee, "children");
                if (p != std::string::npos) n.children = jsonIntArray(json, p);

                p = jsonFind(json, es, ee, "matrix");
                if (p != std::string::npos) {
                    std::vector<float> m = jsonFloatArray(json, p);
                    if (m.size() == 16) n.local = glm::make_mat4(m.data()); 
                } else {
                    glm::mat4 T(1.0f), R(1.0f), S(1.0f);
                    p = jsonFind(json, es, ee, "translation");
                    if (p != std::string::npos) {
                        auto t = jsonFloatArray(json, p);
                        if (t.size() == 3) T = glm::translate(glm::mat4(1.0f), {t[0], t[1], t[2]});
                    }
                    p = jsonFind(json, es, ee, "rotation");
                    if (p != std::string::npos) {
                        auto q = jsonFloatArray(json, p); 
                        if (q.size() == 4) R = glm::mat4_cast(glm::quat(q[3], q[0], q[1], q[2]));
                    }
                    p = jsonFind(json, es, ee, "scale");
                    if (p != std::string::npos) {
                        auto s = jsonFloatArray(json, p);
                        if (s.size() == 3) S = glm::scale(glm::mat4(1.0f), {s[0], s[1], s[2]});
                    }
                    n.local = T * R * S;
                }
                nodes.push_back(n);
            }
        }
    }

    
    std::vector<int> sceneRoots;
    {
        size_t scStart, scEnd;
        if (jsonArrayOf(json, root, rootEnd, "scenes", scStart, scEnd)) {
            size_t es, ee;
            if (jsonArrayElem(json, scStart, scEnd, 0, es, ee)) {
                size_t p = jsonFind(json, es, ee, "nodes");
                if (p != std::string::npos) sceneRoots = jsonIntArray(json, p);
            }
        }
        if (sceneRoots.empty() && !nodes.empty()) sceneRoots.push_back(0);
    }

    
    std::map<int, glm::mat4> meshWorld;
    {
        std::vector<std::pair<int, glm::mat4>> stack;
        for (int r : sceneRoots) stack.push_back({r, glm::mat4(1.0f)});
        while (!stack.empty()) {
            auto [ni, parent] = stack.back(); stack.pop_back();
            if (ni < 0 || ni >= (int)nodes.size()) continue;
            glm::mat4 world = parent * nodes[ni].local;
            if (nodes[ni].mesh >= 0) meshWorld[nodes[ni].mesh] = world;
            for (int c : nodes[ni].children) stack.push_back({c, world});
        }
    }

    
    size_t meshStart, meshEnd;
    if (!jsonArrayOf(json, root, rootEnd, "meshes", meshStart, meshEnd)) {
        std::cerr << "[GltfLoader] Pas de meshes\n"; return false;
    }
    for (int mi = 0; ; ++mi) {
        size_t mes, mee;
        if (!jsonArrayElem(json, meshStart, meshEnd, mi, mes, mee)) break;

        size_t primStart, primEnd;
        if (!jsonArrayOf(json, mes, mee, "primitives", primStart, primEnd)) continue;

        glm::mat4 meshXform(1.0f);
        auto mwIt = meshWorld.find(mi);
        if (mwIt != meshWorld.end()) meshXform = mwIt->second;

        for (int pi = 0; ; ++pi) {
            size_t pes, pee;
            if (!jsonArrayElem(json, primStart, primEnd, pi, pes, pee)) break;

            Primitive prim;
            prim.transform = meshXform;

            
            size_t idxPos = jsonFind(json, pes, pee, "indices");
            if (idxPos != std::string::npos) prim.idxAccessor = jsonInt(json, idxPos);

            
            size_t matPos = jsonFind(json, pes, pee, "material");
            if (matPos != std::string::npos) prim.material = jsonInt(json, matPos);

            
            size_t attrPos = jsonFind(json, pes, pee, "attributes");
            if (attrPos != std::string::npos) {
                size_t attrStart = skipWs(json, attrPos);
                size_t attrEnd   = skipObject(json, attrStart);
                size_t p;
                p = jsonFind(json,attrStart,attrEnd,"POSITION");
                if(p!=std::string::npos) prim.posAccessor  = jsonInt(json,p);
                p = jsonFind(json,attrStart,attrEnd,"NORMAL");
                if(p!=std::string::npos) prim.normAccessor = jsonInt(json,p);
                p = jsonFind(json,attrStart,attrEnd,"TEXCOORD_0");
                if(p!=std::string::npos) prim.uvAccessor   = jsonInt(json,p);
            }

            if (prim.posAccessor >= 0)
                out.primitives.push_back(prim);
        }
    }

    if (out.primitives.empty()) {
        std::cerr << "[GltfLoader] Aucune primitive avec POSITION\n";
        return false;
    }

    
    size_t imgStart, imgEnd;
    if (jsonArrayOf(json, root, rootEnd, "images", imgStart, imgEnd)) {
        for (int i = 0; ; ++i) {
            size_t es, ee;
            if (!jsonArrayElem(json, imgStart, imgEnd, i, es, ee)) break;
            Image img;
            size_t p = jsonFind(json, es, ee, "bufferView");
            if (p != std::string::npos) img.bufferView = jsonInt(json, p);
            p = jsonFind(json, es, ee, "mimeType");
            if (p != std::string::npos) img.mime = jsonStr(json, p);
            out.images.push_back(img);
        }
    }

    
    size_t texStart, texEnd;
    if (jsonArrayOf(json, root, rootEnd, "textures", texStart, texEnd)) {
        for (int i = 0; ; ++i) {
            size_t es, ee;
            if (!jsonArrayElem(json, texStart, texEnd, i, es, ee)) break;
            int source = -1;
            size_t p = jsonFind(json, es, ee, "source");
            if (p != std::string::npos) source = jsonInt(json, p);
            out.textureSource.push_back(source);
        }
    }

    
    
    
    size_t matStart, matEnd;
    if (jsonArrayOf(json, root, rootEnd, "materials", matStart, matEnd)) {
        for (int i = 0; ; ++i) {
            size_t es, ee;
            if (!jsonArrayElem(json, matStart, matEnd, i, es, ee)) break;
            Material mat;
            
            size_t p = jsonFind(json, es, ee, "diffuseTexture");
            if (p == std::string::npos) p = jsonFind(json, es, ee, "baseColorTexture");
            if (p != std::string::npos) {
                size_t ip = jsonFind(json, p, ee, "index");
                if (ip != std::string::npos) mat.diffuseTex = jsonInt(json, ip);
            }
            
            p = jsonFind(json, es, ee, "emissiveTexture");
            if (p != std::string::npos) {
                size_t ip = jsonFind(json, p, ee, "index");
                if (ip != std::string::npos) mat.emissiveTex = jsonInt(json, ip);
            }
            out.materials.push_back(mat);
        }
    }
    return true;
}




template<typename T>
bool GltfLoader::readAccessor(const ParseResult& pr, int accIdx,
                               std::vector<T>& dst)
{
    if (accIdx < 0 || accIdx >= (int)pr.accessors.size()) return false;
    const Accessor&   acc = pr.accessors[accIdx];
    if (acc.bufferView < 0 || acc.bufferView >= (int)pr.bufferViews.size()) return false;
    const BufferView& bv  = pr.bufferViews[acc.bufferView];
    if (pr.bin.empty()) return false;

    size_t compSize = 0;
    switch (acc.componentType) {
        case 5120: case 5121: compSize = 1; break;
        case 5122: case 5123: compSize = 2; break;
        case 5125: case 5126: compSize = 4; break;
        default: return false;
    }

    int    stride    = bv.byteStride ? bv.byteStride
                                     : (int)(acc.numComponents * compSize);
    size_t baseOff   = (size_t)bv.byteOffset + (size_t)acc.byteOffset;
    int    total     = acc.count * acc.numComponents;

    dst.resize((size_t)total);

    for (int i = 0; i < acc.count; ++i) {
        size_t elemOff = baseOff + (size_t)i * (size_t)stride;
        for (int c = 0; c < acc.numComponents; ++c) {
            size_t byteOff = elemOff + (size_t)c * compSize;
            if (byteOff + compSize > pr.bin.size()) return false;

            T val{};
            if (acc.componentType == 5126) {
                
                float f; std::memcpy(&f, pr.bin.data() + byteOff, 4);
                val = static_cast<T>(f);
            } else if (acc.componentType == 5125) {
                
                uint32_t u; std::memcpy(&u, pr.bin.data() + byteOff, 4);
                val = static_cast<T>(u);
            } else if (acc.componentType == 5123) {
                
                uint16_t u; std::memcpy(&u, pr.bin.data() + byteOff, 2);
                val = static_cast<T>(u);
            } else if (acc.componentType == 5122) {
                
                int16_t u; std::memcpy(&u, pr.bin.data() + byteOff, 2);
                val = static_cast<T>(u);
            } else if (acc.componentType == 5121) {
                
                val = static_cast<T>(pr.bin[byteOff]);
            } else if (acc.componentType == 5120) {
                
                val = static_cast<T>((int8_t)pr.bin[byteOff]);
            }
            dst[(size_t)(i * acc.numComponents + c)] = val;
        }
    }
    return true;
}




GpuMesh GltfLoader::upload(std::vector<float>& verts,
                             std::vector<uint32_t>& indices)
{
    
    size_t nv = verts.size() / 6;
    if (nv == 0) return {};

    
    
    
    
    {
        float mnx=1e9f,mny=1e9f,mnz=1e9f,mxx=-1e9f,mxy=-1e9f,mxz=-1e9f;
        for (size_t i=0;i<nv;++i) {
            float x=verts[i*6],y=verts[i*6+1],z=verts[i*6+2];
            mnx=std::min(mnx,x);mxx=std::max(mxx,x);
            mny=std::min(mny,y);mxy=std::max(mxy,y);
            mnz=std::min(mnz,z);mxz=std::max(mxz,z);
        }
        float ex=mxx-mnx, ey=mxy-mny, ez=mxz-mnz;
        int tallest = (ex>=ey && ex>=ez) ? 0 : (ey>=ez ? 1 : 2); 
        if (tallest == 2) {
            
            for (size_t i=0;i<nv;++i) {
                float y=verts[i*6+1], z=verts[i*6+2];
                verts[i*6+1]= z;  verts[i*6+2]=-y;
                float ny=verts[i*6+4], nz=verts[i*6+5];
                verts[i*6+4]=nz; verts[i*6+5]=-ny;
            }
            std::cout << "[GltfLoader] auto-stand: axe Z -> Y (modele redresse)\n";
        } else if (tallest == 0) {
            
            for (size_t i=0;i<nv;++i) {
                float x=verts[i*6], y=verts[i*6+1];
                verts[i*6  ]=-y; verts[i*6+1]=x;
                float nx=verts[i*6+3], ny=verts[i*6+4];
                verts[i*6+3]=-ny; verts[i*6+4]=nx;
            }
            std::cout << "[GltfLoader] auto-stand: axe X -> Y (modele redresse)\n";
        }
    }

    float minX= 1e9f,minY= 1e9f,minZ= 1e9f;
    float maxX=-1e9f,maxY=-1e9f,maxZ=-1e9f;
    for (size_t i=0;i<nv;++i) {
        float x=verts[i*6],y=verts[i*6+1],z=verts[i*6+2];
        minX=std::min(minX,x); maxX=std::max(maxX,x);
        minY=std::min(minY,y); maxY=std::max(maxY,y);
        minZ=std::min(minZ,z); maxZ=std::max(maxZ,z);
    }
    std::cout << "[GltfLoader] extents apres orientation: X="<<(maxX-minX)
              <<" Y="<<(maxY-minY)<<" Z="<<(maxZ-minZ)<<"\n";
    float cx=(minX+maxX)*0.5f, cy=(minY+maxY)*0.5f, cz=(minZ+maxZ)*0.5f;
    float s=1.f/std::max({maxX-minX,maxY-minY,maxZ-minZ,1e-6f});
    for (size_t i=0;i<nv;++i) {
        verts[i*6  ]=(verts[i*6  ]-cx)*s;
        verts[i*6+1]=(verts[i*6+1]-cy)*s;
        verts[i*6+2]=(verts[i*6+2]-cz)*s;
        
        float nx=verts[i*6+3],ny=verts[i*6+4],nz=verts[i*6+5];
        float len=std::sqrt(nx*nx+ny*ny+nz*nz);
        if(len>1e-6f){verts[i*6+3]=nx/len;verts[i*6+4]=ny/len;verts[i*6+5]=nz/len;}
    }

    GpuMesh m;
    glGenVertexArrays(1,&m.vao); glBindVertexArray(m.vao);
    glGenBuffers(1,&m.vbo); glBindBuffer(GL_ARRAY_BUFFER,m.vbo);
    glBufferData(GL_ARRAY_BUFFER,(GLsizeiptr)(verts.size()*sizeof(float)),verts.data(),GL_STATIC_DRAW);
    glGenBuffers(1,&m.ebo); glBindBuffer(GL_ELEMENT_ARRAY_BUFFER,m.ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER,(GLsizeiptr)(indices.size()*sizeof(uint32_t)),indices.data(),GL_STATIC_DRAW);
    const GLsizei stride=6*sizeof(float);
    glVertexAttribPointer(0,3,GL_FLOAT,GL_FALSE,stride,(void*)0);             glEnableVertexAttribArray(0);
    glVertexAttribPointer(1,3,GL_FLOAT,GL_FALSE,stride,(void*)(3*sizeof(float)));glEnableVertexAttribArray(1);
    glBindVertexArray(0);
    m.indexCount=(int)indices.size();
    return m;
}




bool GltfLoader::parseGlb(const std::string& path, ParseResult& out)
{
    auto raw = readFile(path);
    if (raw.size() < 12) { std::cerr<<"[GltfLoader] GLB trop court\n"; return false; }

    
    uint32_t magic; std::memcpy(&magic, raw.data(), 4);
    if (magic != 0x46546C67u) { 
        std::cerr<<"[GltfLoader] Magic GLB incorrect (0x"<<std::hex<<magic<<")\n";
        return false;
    }
    uint32_t version; std::memcpy(&version, raw.data()+4, 4);
    if (version != 2) { std::cerr<<"[GltfLoader] GLB version "<<version<<" non supportée\n"; return false; }

    
    size_t pos = 12;
    std::string jsonChunk;

    while (pos + 8 <= raw.size()) {
        uint32_t chunkLen, chunkType;
        std::memcpy(&chunkLen,  raw.data()+pos,   4);
        std::memcpy(&chunkType, raw.data()+pos+4, 4);
        pos += 8;

        if (pos + chunkLen > raw.size()) break;

        if (chunkType == 0x4E4F534Au) { 
            jsonChunk.assign(raw.begin()+pos, raw.begin()+pos+chunkLen);
        } else if (chunkType == 0x004E4942u) { 
            out.bin.assign(raw.begin()+pos, raw.begin()+pos+chunkLen);
        }
        pos += chunkLen;
    }

    if (jsonChunk.empty()) { std::cerr<<"[GltfLoader] Chunk JSON absent\n"; return false; }
    return parseJson(jsonChunk, "", out);
}




bool GltfLoader::parseGltf(const std::string& path, ParseResult& out)
{
    std::ifstream f(path);
    if (!f) { std::cerr<<"[GltfLoader] Cannot open "<<path<<"\n"; return false; }
    std::string json((std::istreambuf_iterator<char>(f)),
                      std::istreambuf_iterator<char>());

    
    std::string dir;
    auto slash = path.find_last_of("/\\");
    if (slash != std::string::npos) dir = path.substr(0, slash);

    return parseJson(json, dir, out);
}




std::optional<GpuMesh> GltfLoader::load(const std::string& path)
{
    ParseResult pr;
    bool ok = false;

    if (path.size() >= 4 &&
        path.substr(path.size()-4) == ".glb")
        ok = parseGlb(path, pr);
    else
        ok = parseGltf(path, pr);

    if (!ok) return std::nullopt;
    if (pr.bin.empty()) {
        std::cerr<<"[GltfLoader] Buffer binaire absent\n"; return std::nullopt;
    }

    
    std::vector<float>    allVerts;
    std::vector<uint32_t> allIdx;
    uint32_t vertOffset = 0;

    for (const auto& prim : pr.primitives) {
        
        std::vector<float> pos;
        if (!readAccessor<float>(pr, prim.posAccessor, pos)) {
            std::cerr<<"[GltfLoader] WARN: impossible de lire POSITION\n"; continue;
        }
        int nVerts = (int)pos.size() / 3;

        
        std::vector<float> nrm;
        if (prim.normAccessor >= 0) {
            readAccessor<float>(pr, prim.normAccessor, nrm);
        }
        if ((int)nrm.size() < nVerts*3) {
            nrm.resize((size_t)nVerts*3, 0.f);
            
            for (int i=1; i<nVerts*3; i+=3) nrm[i]=1.f;
        }

        
        const glm::mat4& xform = prim.transform;
        const glm::mat3  normalMat = glm::transpose(glm::inverse(glm::mat3(xform)));

        
        for (int v=0; v<nVerts; ++v) {
            glm::vec4 P = xform * glm::vec4(pos[v*3], pos[v*3+1], pos[v*3+2], 1.f);
            glm::vec3 N = normalMat * glm::vec3(nrm[v*3], nrm[v*3+1], nrm[v*3+2]);
            allVerts.push_back(P.x);
            allVerts.push_back(P.y);
            allVerts.push_back(P.z);
            allVerts.push_back(N.x);
            allVerts.push_back(N.y);
            allVerts.push_back(N.z);
        }

        
        if (prim.idxAccessor >= 0) {
            std::vector<uint32_t> idx;
            readAccessor<uint32_t>(pr, prim.idxAccessor, idx);
            for (auto i : idx) allIdx.push_back(i + vertOffset);
        } else {
            
            for (int i=0; i<nVerts; ++i)
                allIdx.push_back((uint32_t)(vertOffset + i));
        }
        vertOffset += (uint32_t)nVerts;
    }

    if (allVerts.empty() || allIdx.empty()) {
        std::cerr<<"[GltfLoader] Mesh vide après fusion\n"; return std::nullopt;
    }

    std::cout<<"[GltfLoader] "<<path<<" — "<<(allVerts.size()/6)
             <<" verts, "<<(allIdx.size()/3)<<" tris, "
             <<pr.primitives.size()<<" primitives\n";

    GpuMesh mesh = upload(allVerts, allIdx);
    if (!mesh.vao) return std::nullopt;
    return mesh;
}





GpuModel GltfLoader::loadModel(const std::string& path)
{
    ParseResult pr;
    bool ok = (path.size() >= 4 && path.substr(path.size()-4) == ".glb")
            ? parseGlb(path, pr) : parseGltf(path, pr);
    if (!ok || pr.bin.empty()) {
        std::cerr << "[GltfLoader] loadModel echec: " << path << "\n";
        return {};
    }

    
    struct Part {
        std::vector<float>    pos, nrm, uv;
        std::vector<uint32_t> idx;
        int material = -1;
    };
    std::vector<Part> parts;

    for (const auto& prim : pr.primitives) {
        std::vector<float> pos;
        if (!readAccessor<float>(pr, prim.posAccessor, pos)) continue;
        int nV = (int)pos.size() / 3;

        std::vector<float> nrm;
        if (prim.normAccessor >= 0) readAccessor<float>(pr, prim.normAccessor, nrm);
        if ((int)nrm.size() < nV*3) {
            nrm.assign((size_t)nV*3, 0.f);
            for (int i=1;i<nV*3;i+=3) nrm[i]=1.f;
        }

        std::vector<float> uv;
        if (prim.uvAccessor >= 0) readAccessor<float>(pr, prim.uvAccessor, uv);
        if ((int)uv.size() < nV*2) uv.assign((size_t)nV*2, 0.f);

        
        const glm::mat4& xf = prim.transform;
        const glm::mat3  nm = glm::transpose(glm::inverse(glm::mat3(xf)));
        for (int v=0; v<nV; ++v) {
            glm::vec4 P = xf * glm::vec4(pos[v*3], pos[v*3+1], pos[v*3+2], 1.f);
            glm::vec3 N = nm  * glm::vec3(nrm[v*3], nrm[v*3+1], nrm[v*3+2]);
            pos[v*3]=P.x; pos[v*3+1]=P.y; pos[v*3+2]=P.z;
            nrm[v*3]=N.x; nrm[v*3+1]=N.y; nrm[v*3+2]=N.z;
        }

        std::vector<uint32_t> idx;
        if (prim.idxAccessor >= 0) readAccessor<uint32_t>(pr, prim.idxAccessor, idx);
        else { idx.resize(nV); for (int i=0;i<nV;++i) idx[i]=(uint32_t)i; }

        parts.push_back({std::move(pos), std::move(nrm), std::move(uv),
                         std::move(idx), prim.material});
    }
    if (parts.empty()) { std::cerr<<"[GltfLoader] loadModel: aucune partie\n"; return {}; }

    
    float mnx=1e9f,mny=1e9f,mnz=1e9f,mxx=-1e9f,mxy=-1e9f,mxz=-1e9f;
    for (auto& pt : parts)
        for (size_t v=0; v<pt.pos.size(); v+=3) {
            mnx=std::min(mnx,pt.pos[v]);   mxx=std::max(mxx,pt.pos[v]);
            mny=std::min(mny,pt.pos[v+1]); mxy=std::max(mxy,pt.pos[v+1]);
            mnz=std::min(mnz,pt.pos[v+2]); mxz=std::max(mxz,pt.pos[v+2]);
        }

    
    float ex=mxx-mnx, ey=mxy-mny, ez=mxz-mnz;
    int tallest = (ex>=ey && ex>=ez) ? 0 : (ey>=ez ? 1 : 2);
    auto rotateAll = [&](int mode){
        for (auto& pt : parts) {
            for (size_t v=0; v<pt.pos.size(); v+=3) {
                float x=pt.pos[v],y=pt.pos[v+1],z=pt.pos[v+2];
                float nx=pt.nrm[v],ny=pt.nrm[v+1],nz=pt.nrm[v+2];
                if (mode==2) { pt.pos[v+1]=z; pt.pos[v+2]=-y; pt.nrm[v+1]=nz; pt.nrm[v+2]=-ny; }
                else         { pt.pos[v]=-y;  pt.pos[v+1]=x;  pt.nrm[v]=-ny;  pt.nrm[v+1]=nx; }
            }
        }
    };
    if (tallest==2) { rotateAll(2); std::cout<<"[GltfLoader] auto-stand Z->Y\n"; }
    else if (tallest==0) { rotateAll(0); std::cout<<"[GltfLoader] auto-stand X->Y\n"; }

    
    mnx=mny=mnz=1e9f; mxx=mxy=mxz=-1e9f;
    for (auto& pt : parts)
        for (size_t v=0; v<pt.pos.size(); v+=3) {
            mnx=std::min(mnx,pt.pos[v]);   mxx=std::max(mxx,pt.pos[v]);
            mny=std::min(mny,pt.pos[v+1]); mxy=std::max(mxy,pt.pos[v+1]);
            mnz=std::min(mnz,pt.pos[v+2]); mxz=std::max(mxz,pt.pos[v+2]);
        }
    std::cout<<"[GltfLoader] extents apres orientation: X="<<(mxx-mnx)
             <<" Y="<<(mxy-mny)<<" Z="<<(mxz-mnz)<<"\n";
    float cx=(mnx+mxx)*0.5f, cy=(mny+mxy)*0.5f, cz=(mnz+mxz)*0.5f;
    float sc=1.f/std::max({mxx-mnx,mxy-mny,mxz-mnz,1e-6f});
    for (auto& pt : parts)
        for (size_t v=0; v<pt.pos.size(); v+=3) {
            pt.pos[v]   = (pt.pos[v]  -cx)*sc;
            pt.pos[v+1] = (pt.pos[v+1]-cy)*sc;
            pt.pos[v+2] = (pt.pos[v+2]-cz)*sc;
        }

    
    auto makeTexture = [&](int texIndex) -> GLuint {
        if (texIndex < 0 || texIndex >= (int)pr.textureSource.size()) return 0;
        int imgIdx = pr.textureSource[texIndex];
        if (imgIdx < 0 || imgIdx >= (int)pr.images.size()) return 0;
        const Image& im = pr.images[imgIdx];
        if (im.bufferView < 0 || im.bufferView >= (int)pr.bufferViews.size()) return 0;
        const BufferView& bv = pr.bufferViews[im.bufferView];
        if ((size_t)bv.byteOffset + (size_t)bv.byteLength > pr.bin.size()) return 0;

        int w=0,h=0,c=0;
        stbi_uc* pix = stbi_load_from_memory(pr.bin.data()+bv.byteOffset,
                                             bv.byteLength, &w, &h, &c, 4);
        if (!pix) { std::cerr<<"[GltfLoader] decode image "<<imgIdx<<" echoue\n"; return 0; }

        GLuint t=0; glGenTextures(1,&t); glBindTexture(GL_TEXTURE_2D,t);
        glTexImage2D(GL_TEXTURE_2D,0,GL_RGBA,w,h,0,GL_RGBA,GL_UNSIGNED_BYTE,pix);
        glGenerateMipmap(GL_TEXTURE_2D);
        glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_S,GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_WRAP_T,GL_REPEAT);
        glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR_MIPMAP_LINEAR);
        glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MAG_FILTER,GL_LINEAR);
        glBindTexture(GL_TEXTURE_2D,0);
        stbi_image_free(pix);
        return t;
    };

    
    GpuModel model;
    size_t totalTris = 0;
    for (auto& pt : parts) {
        int nV = (int)pt.pos.size()/3;
        std::vector<float> verts; verts.reserve((size_t)nV*8);
        for (int v=0; v<nV; ++v) {
            verts.push_back(pt.pos[v*3]);   verts.push_back(pt.pos[v*3+1]); verts.push_back(pt.pos[v*3+2]);
            float nx=pt.nrm[v*3],ny=pt.nrm[v*3+1],nz=pt.nrm[v*3+2];
            float ln=std::sqrt(nx*nx+ny*ny+nz*nz); if(ln>1e-6f){nx/=ln;ny/=ln;nz/=ln;}
            verts.push_back(nx); verts.push_back(ny); verts.push_back(nz);
            
            verts.push_back(pt.uv[v*2]); verts.push_back(1.f - pt.uv[v*2+1]);
        }

        GpuMesh m;
        glGenVertexArrays(1,&m.vao); glBindVertexArray(m.vao);
        glGenBuffers(1,&m.vbo); glBindBuffer(GL_ARRAY_BUFFER,m.vbo);
        glBufferData(GL_ARRAY_BUFFER,(GLsizeiptr)(verts.size()*sizeof(float)),verts.data(),GL_STATIC_DRAW);
        glGenBuffers(1,&m.ebo); glBindBuffer(GL_ELEMENT_ARRAY_BUFFER,m.ebo);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER,(GLsizeiptr)(pt.idx.size()*sizeof(uint32_t)),pt.idx.data(),GL_STATIC_DRAW);
        const GLsizei stride=8*sizeof(float);
        glVertexAttribPointer(0,3,GL_FLOAT,GL_FALSE,stride,(void*)0);                 glEnableVertexAttribArray(0);
        glVertexAttribPointer(1,3,GL_FLOAT,GL_FALSE,stride,(void*)(3*sizeof(float))); glEnableVertexAttribArray(1);
        glVertexAttribPointer(2,2,GL_FLOAT,GL_FALSE,stride,(void*)(6*sizeof(float))); glEnableVertexAttribArray(2);
        glBindVertexArray(0);
        m.indexCount=(int)pt.idx.size();

        if (pt.material >= 0 && pt.material < (int)pr.materials.size()) {
            const Material& mat = pr.materials[pt.material];
            m.diffuseTex  = makeTexture(mat.diffuseTex);
            m.emissiveTex = makeTexture(mat.emissiveTex);
        }
        totalTris += pt.idx.size()/3;
        model.push_back(std::move(m));
    }

    std::cout<<"[GltfLoader] "<<path<<" — "<<model.size()<<" sous-mesh, "
             <<totalTris<<" tris (texture)\n";
    return model;
}





bool GltfLoader::loadIntoObjModel(const std::string& path, ObjModel& out)
{
    ParseResult pr;
    bool ok = (path.size() >= 4 && path.substr(path.size() - 4) == ".glb")
            ? parseGlb(path, pr) : parseGltf(path, pr);
    if (!ok || pr.bin.empty()) {
        std::cerr << "[GltfLoader] loadIntoObjModel: parsing echoue: " << path << "\n";
        return false;
    }

    
    std::vector<float>    verts;   
    std::vector<uint32_t> idxAll;
    uint32_t vertOffset = 0;

    for (const auto& prim : pr.primitives) {
        std::vector<float> pos;
        if (!readAccessor<float>(pr, prim.posAccessor, pos)) continue;
        int nVerts = (int)pos.size() / 3;
        if (nVerts <= 0) continue;

        std::vector<float> nrm;
        if (prim.normAccessor >= 0) readAccessor<float>(pr, prim.normAccessor, nrm);
        if ((int)nrm.size() < nVerts * 3) {
            nrm.assign((size_t)nVerts * 3, 0.f);
            for (int i = 1; i < nVerts * 3; i += 3) nrm[i] = 1.f;
        }

        const glm::mat4& xf = prim.transform;
        const glm::mat3  nm = glm::transpose(glm::inverse(glm::mat3(xf)));

        for (int v = 0; v < nVerts; ++v) {
            glm::vec4 P = xf * glm::vec4(pos[v*3], pos[v*3+1], pos[v*3+2], 1.f);
            glm::vec3 N = nm * glm::vec3(nrm[v*3], nrm[v*3+1], nrm[v*3+2]);
            float ln = glm::length(N);
            if (ln > 1e-8f) N /= ln; else N = glm::vec3(0.f, 1.f, 0.f);
            verts.push_back(P.x); verts.push_back(P.y); verts.push_back(P.z);
            verts.push_back(N.x); verts.push_back(N.y); verts.push_back(N.z);
        }

        if (prim.idxAccessor >= 0) {
            std::vector<uint32_t> idx;
            readAccessor<uint32_t>(pr, prim.idxAccessor, idx);
            for (auto i : idx) idxAll.push_back(i + vertOffset);
        } else {
            for (int i = 0; i < nVerts; ++i)
                idxAll.push_back(vertOffset + (uint32_t)i);
        }
        vertOffset += (uint32_t)nVerts;
    }

    if (verts.empty() || idxAll.empty()) {
        std::cerr << "[GltfLoader] loadIntoObjModel: mesh vide: " << path << "\n";
        return false;
    }

    
    const float FMAX = std::numeric_limits<float>::max();
    float minX = FMAX, minY = FMAX, minZ = FMAX;
    float maxX = -FMAX, maxY = -FMAX, maxZ = -FMAX;
    size_t nV = verts.size() / 6;
    for (size_t i = 0; i < nV; ++i) {
        float x = verts[i*6], y = verts[i*6+1], z = verts[i*6+2];
        minX = std::min(minX, x); maxX = std::max(maxX, x);
        minY = std::min(minY, y); maxY = std::max(maxY, y);
        minZ = std::min(minZ, z); maxZ = std::max(maxZ, z);
    }
    float cx = (minX + maxX) * 0.5f;
    float cz = (minZ + maxZ) * 0.5f;
    float height = maxY - minY;
    float scale  = (height > 1e-6f) ? 1.f / height : 1.f;

    
    out.vertexData.clear();
    out.vertexData.reserve(idxAll.size() * 6);
    float maxR = 0.f;
    for (uint32_t ix : idxAll) {
        size_t b = (size_t)ix * 6;
        float x = (verts[b]     - cx)   * scale;
        float y = (verts[b + 1] - minY) * scale;
        float z = (verts[b + 2] - cz)   * scale;
        out.vertexData.push_back(x);
        out.vertexData.push_back(y);
        out.vertexData.push_back(z);
        out.vertexData.push_back(verts[b + 3]);
        out.vertexData.push_back(verts[b + 4]);
        out.vertexData.push_back(verts[b + 5]);
        float r = std::sqrt(x*x + y*y + z*z);
        if (r > maxR) maxR = r;
    }
    out.boundingRadius = (maxR > 1e-6f) ? maxR : 1.f;

    std::cout << "[GltfLoader] ObjModel <- " << path << " ("
              << out.vertexData.size() / 6 << " sommets, hauteur normalisee)\n";
    return true;
}
