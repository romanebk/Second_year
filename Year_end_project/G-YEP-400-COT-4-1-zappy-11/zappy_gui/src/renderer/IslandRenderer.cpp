#include "IslandRenderer.hpp"
#include "GltfLoader.hpp"
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <cmath>
#include <fstream>
#include <sstream>
#include <iostream>
#include <functional>
#include <algorithm>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

static glm::vec3 readMtlColor(const std::string &mtlPath, const glm::vec3 &fallback)
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

static std::string mtlPathFromObj(const std::string &objPath)
{
    size_t dot = objPath.rfind('.');
    if (dot == std::string::npos) return objPath + ".mtl";
    return objPath.substr(0, dot) + ".mtl";
}

unsigned IslandRenderer::hashTile(int x, int y, unsigned salt)
{
    unsigned h = (unsigned)(x * 374761393 + y * 668265263 + salt * 982451653);
    h = (h ^ (h >> 13)) * 1274126177u;
    h = h ^ (h >> 16);
    return h;
}

float IslandRenderer::hashFloat(int x, int y, unsigned salt)
{
    return (hashTile(x, y, salt) & 0xFFFFFF) / float(0xFFFFFF);
}

void IslandRenderer::InstanceBatch::add(const glm::mat4 &m, const glm::vec3 &color)
{
    const float *mp = glm::value_ptr(m);
    matrices.insert(matrices.end(), mp, mp + 16);
    colors.push_back(color.r);
    colors.push_back(color.g);
    colors.push_back(color.b);
    ++count;
}

void IslandRenderer::init(ThemeMode theme)
{
    if (_ready) return;
    _theme = theme;

    std::string folder = themeFolder(theme);

    std::string islandObj = "assets/islands/" + folder + ".obj";
    if (ObjLoader::load(islandObj, _island)) {
        _island.upload();
        _island.setupInstancing();
        _islandColor = readMtlColor(mtlPathFromObj(islandObj), _islandColor);
    } else {
        std::cerr << "[IslandRenderer] Ilot introuvable : " << islandObj << "\n";
    }

    switch (theme) {
        case ThemeMode::Yavin:    _topY = 0.42f; break;
        case ThemeMode::Tatooine: _topY = 0.30f; break;
        case ThemeMode::Jedha:    _topY = 0.52f; break;
    }

    std::string ruinObj = "assets/decor/ruins/ruin_" + folder + ".obj";
    if (ObjLoader::load(ruinObj, _ruin)) {
        _ruin.upload();
        _ruin.setupInstancing();
        _ruinColor = readMtlColor(mtlPathFromObj(ruinObj), _ruinColor);
    } else {
        std::cerr << "[IslandRenderer] Ruine introuvable : " << ruinObj << "\n";
    }

    _treeCount = 0;
    if (theme == ThemeMode::Yavin) {
        for (int i = 0; i < 2; ++i) {
            std::ostringstream path;
            path << "assets/decor/trees/tree_yavin_0" << (i + 1) << ".obj";
            if (ObjLoader::load(path.str(), _trees[i])) {
                _trees[i].upload();
                _trees[i].setupInstancing();
                if (i == 0)
                    _treeColor = readMtlColor(mtlPathFromObj(path.str()), _treeColor);
                ++_treeCount;
            }
        }
    }

    static const char* astNames[2] = { "small", "medium" };
    for (int i = 0; i < 2; ++i) {
        std::string path = std::string("assets/decor/asteroids/asteroid_") + astNames[i] + ".obj";
        if (ObjLoader::load(path, _asteroids[i])) {
            _asteroids[i].upload();
            _asteroids[i].setupInstancing();
            if (i == 0)
                _asteroidColor = readMtlColor(mtlPathFromObj(path), _asteroidColor);
        } else {
            std::cerr << "[IslandRenderer] Asteroide introuvable : " << path << "\n";
        }
    }

    buildAlienModel();
    buildEggModel();

    _ready = true;
    std::cout << "[IslandRenderer] Style '" << themeName(theme)
              << "' initialise (ilot + ruine + " << _treeCount
              << " arbre(s) + 2 asteroides + aliens, instancing actif).\n";
}


static void appendEllipsoid(std::vector<float> &out,
                            float cx, float cy, float cz,
                            float rx, float ry, float rz,
                            int stacks, int slices)
{
    auto vertex = [&](float phi, float theta) {
        float sp = std::sin(phi),  cp = std::cos(phi);
        float st = std::sin(theta), ct = std::cos(theta);
        float ux = sp * ct, uy = cp, uz = sp * st;       
        float px = cx + rx * ux, py = cy + ry * uy, pz = cz + rz * uz;
        
        float nx = ux / rx, ny = uy / ry, nz = uz / rz;
        float len = std::sqrt(nx*nx + ny*ny + nz*nz);
        if (len > 1e-8f) { nx/=len; ny/=len; nz/=len; }
        out.push_back(px); out.push_back(py); out.push_back(pz);
        out.push_back(nx); out.push_back(ny); out.push_back(nz);
    };

    for (int i = 0; i < stacks; ++i) {
        float phi0 = (float)M_PI * i / stacks;
        float phi1 = (float)M_PI * (i + 1) / stacks;
        for (int j = 0; j < slices; ++j) {
            float th0 = 2.f * (float)M_PI * j / slices;
            float th1 = 2.f * (float)M_PI * (j + 1) / slices;
            
            vertex(phi0, th0); vertex(phi1, th0); vertex(phi0, th1);
            vertex(phi1, th0); vertex(phi1, th1); vertex(phi0, th1);
        }
    }
}

void IslandRenderer::buildAlienModel()
{
    if (_alien.uploaded) return;

    
    if (!GltfLoader::loadIntoObjModel("assets/models/nasa_alien.glb", _alien) &&
        !GltfLoader::loadIntoObjModel("assets/models/alien.glb", _alien)) {
        std::cerr << "[IslandRenderer] modele alien introuvable, repli procedural.\n";
        std::vector<float> v;
        appendEllipsoid(v, 0.f, 0.50f, 0.f, 0.42f, 0.50f, 0.42f, 14, 18); 
        appendEllipsoid(v, 0.f, 1.05f, 0.f, 0.40f, 0.40f, 0.40f, 14, 18); 
        appendEllipsoid(v, 0.f, 1.00f, 0.34f, 0.16f, 0.13f, 0.18f, 10, 12); 
        _alien.vertexData = std::move(v);
    }
    _alien.upload();
    
    
}

void IslandRenderer::buildEggModel()
{
    if (_egg.uploaded) return;

    if (!GltfLoader::loadIntoObjModel("assets/models/alien_egg.glb", _egg)) {
        std::cerr << "[IslandRenderer] alien_egg.glb introuvable, repli procedural.\n";
        std::vector<float> v;
        appendEllipsoid(v, 0.f, 0.30f, 0.f, 0.26f, 0.34f, 0.26f, 12, 16);
        _egg.vertexData = std::move(v);
    }
    _egg.upload();
    _egg.setupInstancing();
}

void IslandRenderer::update(float dt)
{
    _orbitTime += dt;
    _dt = dt;
}

void IslandRenderer::flushBatch(Shader &, ObjModel &model, InstanceBatch &batch)
{
    if (batch.count == 0 || !model.instancingReady) return;
    model.updateInstances(batch.matrices.data(), batch.colors.data(), batch.count);
    model.bindAndDrawInstanced(batch.count);
}

void IslandRenderer::draw(Shader &instancedShader, Shader &resourceShader,
                           Shader &playerShader,
                           const GameState &state, const Camera &camera,
                           float aspect, ResourceRenderer &resourceRenderer,
                           const ViewFilters &filters, int *outVisibleTiles)
{
    if (!_ready || state.mapWidth == 0 || state.mapHeight == 0) return;

    glm::mat4 view = camera.getView();
    glm::mat4 proj = camera.getProjection(aspect);

    _frustum.update(proj * view);

    const float offsetX = -(state.mapWidth  - 1) * 0.5f * ISLAND_SPACING;
    const float offsetZ = -(state.mapHeight - 1) * 0.5f * ISLAND_SPACING;
    const float wrapDx  = state.mapWidth  * ISLAND_SPACING;
    const float wrapDz  = state.mapHeight * ISLAND_SPACING;

    _islandBatch.clear();
    _ruinBatch.clear();
    for (auto &b : _treeBatch)     b.clear();
    for (auto &b : _asteroidBatch) b.clear();

    int visibleIslands = 0, totalIslands = 0;
    const int mapArea = state.mapWidth * state.mapHeight;
    const bool enableWrap = mapArea <= 120;

    auto processTile = [&](int col, int row, float cx, float cz, bool ghost) {
        ++totalIslands;
        glm::vec3 islandCenter(cx, _topY, cz);
        if (!_frustum.sphereInFrustum(islandCenter, ISLAND_CULL_RADIUS))
            return;
        ++visibleIslands;

        float islandRot   = hashFloat(col, row, 1) * 2.f * (float)M_PI;
        float islandScale = 0.85f + hashFloat(col, row, 2) * 0.3f;
        float topY = _topY * islandScale;

        glm::vec3 colTint = ghost ? glm::vec3(0.7f) : glm::vec3(1.f);
        glm::mat4 islandModel = glm::translate(glm::mat4(1.f), glm::vec3(cx, 0.f, cz));
        islandModel = glm::rotate(islandModel, islandRot, glm::vec3(0.f, 1.f, 0.f));
        islandModel = glm::scale(islandModel, glm::vec3(islandScale));
        _islandBatch.add(islandModel, _islandColor * colTint);

        if (_treeCount > 0) {
            int nTrees = 2 + (int)(hashFloat(col, row, 3) * 3.f);
            for (int i = 0; i < nTrees; ++i) {
                float a = hashFloat(col, row, 10 + i) * 2.f * (float)M_PI;
                float r = 0.15f + hashFloat(col, row, 20 + i) * 0.35f;
                float tx = cx + r * cosf(a), tz = cz + r * sinf(a);
                float tRot = hashFloat(col, row, 30 + i) * 2.f * (float)M_PI;
                float tScale = 0.8f + hashFloat(col, row, 40 + i) * 0.4f;
                glm::mat4 m = glm::translate(glm::mat4(1.f), glm::vec3(tx, topY, tz));
                m = glm::rotate(m, tRot, glm::vec3(0.f, 1.f, 0.f));
                m = glm::scale(m, glm::vec3(tScale * islandScale));
                _treeBatch[i % _treeCount].add(m, _treeColor * colTint);
            }
        }

        {
            float a = hashFloat(col, row, 50) * 2.f * (float)M_PI;
            float r = 0.2f + hashFloat(col, row, 51) * 0.25f;
            glm::mat4 m = glm::translate(glm::mat4(1.f),
                glm::vec3(cx + r * cosf(a), topY, cz + r * sinf(a)));
            m = glm::rotate(m, hashFloat(col, row, 52) * 2.f * (float)M_PI, glm::vec3(0.f, 1.f, 0.f));
            m = glm::scale(m, glm::vec3(islandScale));
            _ruinBatch.add(m, _ruinColor * colTint);
        }

        int nAsteroids = 3 + (int)(hashFloat(col, row, 60) * 3.f);
        for (int i = 0; i < nAsteroids; ++i) {
            int sizeIdx = (int)(hashFloat(col, row, 70 + i) * 2.f) % 2;
            float baseAngle = hashFloat(col, row, 80 + i) * 2.f * (float)M_PI;
            float orbitSpeed = 0.1f + hashFloat(col, row, 90 + i) * 0.25f;
            float dir = (i % 2 == 0) ? 1.f : -1.f;
            float angle = baseAngle + dir * _orbitTime * orbitSpeed;
            float dist = 0.9f + hashFloat(col, row, 100 + i) * 0.9f;
            float height = (hashFloat(col, row, 110 + i) - 0.5f) * 1.8f;
            float ax = cx + dist * cosf(angle);
            float az = cz + dist * sinf(angle);
            float ay = topY + height;
            glm::mat4 m = glm::translate(glm::mat4(1.f), glm::vec3(ax, ay, az));
            m = glm::rotate(m, hashFloat(col, row, 130 + i) * 2.f * (float)M_PI, glm::vec3(0.f, 1.f, 0.f));
            m = glm::scale(m, glm::vec3(0.7f + hashFloat(col, row, 140 + i) * 0.6f));
            _asteroidBatch[sizeIdx].add(m, _asteroidColor * colTint);
        }
    };

    for (auto &[coord, tile] : state.tiles) {
        int col = coord.first, row = coord.second;
        float cx = offsetX + col * ISLAND_SPACING;
        float cz = offsetZ + row * ISLAND_SPACING;
        processTile(col, row, cx, cz, false);

        
        if (enableWrap) {
            if (col == 0)                    processTile(col, row, cx + wrapDx, cz, true);
            if (col == state.mapWidth - 1)   processTile(col, row, cx - wrapDx, cz, true);
            if (row == 0)                    processTile(col, row, cx, cz + wrapDz, true);
            if (row == state.mapHeight - 1)  processTile(col, row, cx, cz - wrapDz, true);
        }
    }

    instancedShader.use();
    instancedShader.setMat4("view",       view);
    instancedShader.setMat4("projection", proj);

    flushBatch(instancedShader, _island, _islandBatch);
    flushBatch(instancedShader, _ruin,   _ruinBatch);
    for (int i = 0; i < _treeCount; ++i)
        flushBatch(instancedShader, _trees[i], _treeBatch[i]);
    for (int i = 0; i < 2; ++i)
        flushBatch(instancedShader, _asteroids[i], _asteroidBatch[i]);

    resourceShader.use();
    resourceShader.setMat4("view",       view);
    resourceShader.setMat4("projection", proj);

    resourceRenderer.beginBatch();

    if (filters.showResources) {
        for (auto &[coord, tile] : state.tiles) {
            int col = coord.first, row = coord.second;
            float cx = offsetX + col * ISLAND_SPACING;
            float cz = offsetZ + row * ISLAND_SPACING;
            if (!_frustum.sphereInFrustum(glm::vec3(cx, _topY, cz), ISLAND_CULL_RADIUS))
                continue;
            float islandScale = 0.85f + hashFloat(col, row, 2) * 0.3f;
            float topY = _topY * islandScale;
            const int counts[7] = {
                tile.resources.food, tile.resources.linemate, tile.resources.deraumere,
                tile.resources.sibur, tile.resources.mendiane, tile.resources.phiras,
                tile.resources.thystame
            };
            for (int ri = 0; ri < 7; ++ri) {
                if (counts[ri] <= 0) continue;
                float a = hashFloat(col, row, 200 + ri) * 2.f * (float)M_PI;
                float r = 0.10f + hashFloat(col, row, 210 + ri) * 0.40f;
                auto mineral = static_cast<ResourceRenderer::Mineral>(ri);
                float scale = ResourceRenderer::TARGET_RADIUS /
                    resourceRenderer.boundingRadius(mineral) * islandScale;
                glm::mat4 m = glm::translate(glm::mat4(1.f),
                    glm::vec3(cx + r * cosf(a), topY, cz + r * sinf(a)));
                m = glm::scale(m, glm::vec3(scale));
                resourceRenderer.addInstance(mineral, m);
            }
        }
    }

    resourceRenderer.flush(resourceShader);

    instancedShader.use();
    instancedShader.setMat4("view", view);
    instancedShader.setMat4("projection", proj);

    if (filters.showIncantations) {
        drawIncantations(instancedShader, state, offsetX, offsetZ, filters);
        drawIncantationBursts(instancedShader, state, offsetX, offsetZ, filters);
    }

    if (filters.showEggs)
        drawEggs(instancedShader, state, offsetX, offsetZ, filters);

    if (filters.showPlayers) {
        updateAndDrawPlayers(playerShader, state, camera.getPosition(), _orbitTime,
                             view, proj, offsetX, offsetZ, filters);
        if (mapArea <= 150)
            updateAndDrawFigurants(playerShader, state, camera.getPosition(), _orbitTime,
                                   view, proj, offsetX, offsetZ);
    }

    if (filters.showBroadcasts)
        drawBroadcastWaves(instancedShader, state, offsetX, offsetZ, filters);

    if (outVisibleTiles) *outVisibleTiles = visibleIslands;

    static int frameCounter = 0;
    if (++frameCounter % 120 == 0)
        std::cout << "[IslandRenderer] Ilots visibles : " << visibleIslands
                  << " / " << totalIslands << "\n";
}

float IslandRenderer::orientationToYaw(int orientation)
{
    
    switch (orientation) {
        case 1: return (float)M_PI;        
        case 2: return (float)M_PI / 2.f;  
        case 3: return 0.f;                
        case 4: return -(float)M_PI / 2.f; 
        default: return 0.f;
    }
}

glm::vec3 IslandRenderer::teamColor(const std::string &team)
{
    
    std::size_t h = std::hash<std::string>{}(team);
    float hue = (h % 360) / 360.f;
    float s = 0.65f, val = 0.95f;

    float r = 0.f, g = 0.f, b = 0.f;
    float i = std::floor(hue * 6.f);
    float f = hue * 6.f - i;
    float p = val * (1.f - s);
    float q = val * (1.f - f * s);
    float t = val * (1.f - (1.f - f) * s);
    switch (((int)i) % 6) {
        case 0: r = val; g = t;   b = p;   break;
        case 1: r = q;   g = val; b = p;   break;
        case 2: r = p;   g = val; b = t;   break;
        case 3: r = p;   g = q;   b = val; break;
        case 4: r = t;   g = p;   b = val; break;
        case 5: r = val; g = p;   b = q;   break;
    }
    return glm::vec3(r, g, b);
}




static float mapSizeFactor(const GameState &state)
{
    float dim = (float)std::max(state.mapWidth, state.mapHeight);
    return std::clamp(dim / 12.f, 1.0f, 2.0f);
}



static int shortestStep(int c, int b, int n)
{
    if (c == b || n <= 0) return 0;
    int d = b - c;
    int forward  = ((d % n) + n) % n;   
    int backward = n - forward;         
    return (forward <= backward) ? +1 : -1;
}





static void buildPath(int ax, int ay, int bx, int by, int W, int H,
                      std::deque<IslandRenderer::PathStep> &out)
{
    int cx = ax, cy = ay;
    int guard = 0, maxGuard = (W + H) * 2 + 8;

    while (cx != bx && guard++ < maxGuard) {
        int s  = shortestStep(cx, bx, W);
        int nx = cx + s;
        bool tele = false;
        if (nx < 0)      { nx += W; tele = true; }
        else if (nx >= W){ nx -= W; tele = true; }
        out.push_back({nx, cy, tele});
        cx = nx;
    }
    while (cy != by && guard++ < maxGuard) {
        int s  = shortestStep(cy, by, H);
        int ny = cy + s;
        bool tele = false;
        if (ny < 0)      { ny += H; tele = true; }
        else if (ny >= H){ ny -= H; tele = true; }
        out.push_back({cx, ny, tele});
        cy = ny;
    }
}

void IslandRenderer::updateAndDrawPlayers(Shader &playerShader, const GameState &state,
                                          const glm::vec3 &viewPos, float sceneTime,
                                          const glm::mat4 &view, const glm::mat4 &proj,
                                          float offsetX, float offsetZ,
                                          const ViewFilters &filters)
{
    (void)filters;
    if (!_alien.uploaded) return;

    const float sizeFactor = mapSizeFactor(state);
    const int   W = std::max(1, state.mapWidth);
    const int   H = std::max(1, state.mapHeight);

    auto tileWorldX = [&](int gx) { return offsetX + gx * ISLAND_SPACING; };
    auto tileWorldZ = [&](int gy) { return offsetZ + gy * ISLAND_SPACING; };
    auto tileScale  = [&](int gx, int gy) { return 0.85f + hashFloat(gx, gy, 2) * 0.3f; };
    auto tileTopY   = [&](int gx, int gy) { return _topY * tileScale(gx, gy); };

    for (auto &kv : _playerVisuals) kv.second.seen = false;

    playerShader.use();
    playerShader.setMat4("view",       view);
    playerShader.setMat4("projection", proj);
    playerShader.setVec3("viewPos",    viewPos);
    playerShader.setFloat("time",      sceneTime);

    for (auto &[id, p] : state.players) {
        PlayerVisual &v = _playerVisuals[id];
        v.seen = true;

        if (!v.initialized) {
            v.curTileX = v.lastTileX = p.x;
            v.curTileY = v.lastTileY = p.y;
            v.curX     = tileWorldX(p.x);
            v.curZ     = tileWorldZ(p.y);
            v.curTopY  = tileTopY(p.x, p.y);
            v.yaw      = v.targetYaw = orientationToYaw(p.orientation);
            v.initialized = true;
        }

        
        
        if (p.x != v.lastTileX || p.y != v.lastTileY) {
            buildPath(v.lastTileX, v.lastTileY, p.x, p.y, W, H, v.path);
            v.lastTileX = p.x;
            v.lastTileY = p.y;
            
            
            while (v.path.size() > 64) v.path.pop_front();
        }

        
        while (!v.hopping && !v.path.empty()) {
            PathStep wp = v.path.front();
            float wx = tileWorldX(wp.x), wz = tileWorldZ(wp.y);
            if (wp.teleport) {
                
                v.curX = wx; v.curZ = wz;
                v.curTopY  = tileTopY(wp.x, wp.y);
                v.curTileX = wp.x; v.curTileY = wp.y;
                v.path.pop_front();
                continue;
            }
            v.fromX = v.curX;   v.fromZ = v.curZ;   v.fromTopY = v.curTopY;
            v.toX   = wx;       v.toZ   = wz;        v.toTopY   = tileTopY(wp.x, wp.y);
            float dx = v.toX - v.fromX, dz = v.toZ - v.fromZ;
            v.segLen = std::max(std::sqrt(dx * dx + dz * dz), 1e-4f);
            v.t = 0.f;
            v.hopping = true;
            
            v.targetYaw = std::atan2(dx, dz);
        }

        
        
        bool jumping = false;
        if (v.hopping) {
            
            
            float catchUp = std::min(1.f + 0.35f * (float)v.path.size(), 3.f);
            v.t += (PLAYER_MOVE_SPEED * catchUp * _dt) / v.segLen;
            if (v.t >= 1.f) {
                v.curX = v.toX; v.curZ = v.toZ; v.curTopY = v.toTopY;
                v.curTileX = v.path.front().x;
                v.curTileY = v.path.front().y;
                v.path.pop_front();
                v.hopping = false;
                v.t = 1.f;
            } else {
                v.curX = v.fromX + (v.toX - v.fromX) * v.t;
                v.curZ = v.fromZ + (v.toZ - v.fromZ) * v.t;
                v.curTopY = v.fromTopY + (v.toTopY - v.fromTopY) * v.t;
                jumping = true;
            }
        }

        
        float jumpY = jumping
            ? std::sin(v.t * (float)M_PI) * PLAYER_JUMP_HEIGHT * sizeFactor
            : 0.f;

        
        if (!v.hopping && v.path.empty())
            v.targetYaw = orientationToYaw(p.orientation);

        
        float targetWalk = jumping ? 1.f : 0.f;
        v.walkAmount += (targetWalk - v.walkAmount) * std::min(1.f, _dt * 8.f);
        v.walkPhase  += _dt * PLAYER_WALK_CADENCE;

        
        float dyaw = v.targetYaw - v.yaw;
        while (dyaw >  (float)M_PI) dyaw -= 2.f * (float)M_PI;
        while (dyaw < -(float)M_PI) dyaw += 2.f * (float)M_PI;
        float yawStep = PLAYER_TURN_SPEED * _dt;
        if (std::fabs(dyaw) <= yawStep) v.yaw = v.targetYaw;
        else                            v.yaw += (dyaw > 0.f ? 1.f : -1.f) * yawStep;

        float worldScale = 0.75f * tileScale(v.curTileX, v.curTileY) * sizeFactor;
        worldScale *= 1.f + (float)p.level * 0.04f;
        if (p.incantFlashTimer > 0.f) {
            const float flashT = p.incantFlashTimer / 2.5f;
            const float pulse = 0.5f + 0.5f * std::sin(sceneTime * 10.f);
            worldScale *= 1.f + 0.18f * pulse * flashT;
        }

        glm::vec3 color = teamColor(p.teamName);
        switch (p.activity) {
            case PlayerActivity::Taking:  color *= glm::vec3(1.2f, 1.2f, 0.7f); break;
            case PlayerActivity::Dropping: color *= glm::vec3(1.2f, 0.8f, 0.6f); break;
            case PlayerActivity::Forking:  color *= glm::vec3(1.3f, 0.9f, 1.3f); break;
            case PlayerActivity::Incanting:
                color = glm::mix(color, glm::vec3(0.5f, 0.8f, 1.f),
                    0.5f + 0.5f * std::sin(sceneTime * 4.f)); break;
            default: break;
        }

        if (p.incantFlashTimer > 0.f) {
            const float flashT = p.incantFlashTimer / 2.5f;
            const float pulse = 0.5f + 0.5f * std::sin(sceneTime * 10.f);
            const glm::vec3 flashCol = p.incantFlashSuccess
                ? glm::vec3(0.25f, 1.f, 0.45f)
                : glm::vec3(1.f, 0.22f, 0.18f);
            color = glm::mix(color, flashCol, pulse * flashT);
        }

        float actWalk = v.walkAmount;
        if (p.activity == PlayerActivity::Taking || p.activity == PlayerActivity::Dropping)
            actWalk *= 0.3f;
        if (p.activity == PlayerActivity::Incanting)
            actWalk *= 0.1f;
        if (p.activity == PlayerActivity::Forking)
            actWalk = 0.5f + 0.5f * std::sin(sceneTime * 6.f);

        glm::mat4 m = glm::translate(glm::mat4(1.f),
                                     glm::vec3(v.curX, v.curTopY + jumpY, v.curZ));
        m = glm::rotate(m, v.yaw, glm::vec3(0.f, 1.f, 0.f));
        m = glm::scale(m, glm::vec3(worldScale));

        playerShader.setMat4("model",      m);
        playerShader.setVec3("teamColor",  color);
        playerShader.setFloat("walkPhase",  v.walkPhase);
        playerShader.setFloat("walkAmount", actWalk);
        playerShader.setFloat("playerLevel", (float)p.level);
        _alien.bindAndDraw();
    }

    
    for (auto it = _playerVisuals.begin(); it != _playerVisuals.end(); ) {
        if (!it->second.seen) it = _playerVisuals.erase(it);
        else                  ++it;
    }
}

void IslandRenderer::drawEggs(Shader &shader, const GameState &state,
                             float offsetX, float offsetZ, const ViewFilters &filters)
{
    (void)filters;
    if (!_egg.instancingReady || state.eggs.empty()) return;

    _eggBatch.clear();
    const float sizeFactor = mapSizeFactor(state);

    for (auto &[id, e] : state.eggs) {
        glm::vec3 eggCol = e.teamName.empty()
            ? glm::vec3(0.93f, 0.90f, 0.78f)
            : teamColor(e.teamName) * 0.6f + glm::vec3(0.35f);

        float islandScale = 0.85f + hashFloat(e.x, e.y, 2) * 0.3f;
        float topY = _topY * islandScale;
        float cx = offsetX + e.x * ISLAND_SPACING;
        float cz = offsetZ + e.y * ISLAND_SPACING;
        float a = hashFloat(e.x, e.y, 300 + (id & 0xFF)) * 2.f * (float)M_PI;
        float r = hashFloat(e.x, e.y, 310 + (id & 0xFF)) * 0.35f;
        cx += r * std::cos(a); cz += r * std::sin(a);
        float hover = std::sin(_orbitTime * 1.5f + (float)id) * 0.04f + 0.04f;
        float worldScale = 0.5f * islandScale * sizeFactor;

        glm::mat4 m = glm::translate(glm::mat4(1.f), glm::vec3(cx, topY + hover, cz));
        m = glm::scale(m, glm::vec3(worldScale));
        _eggBatch.add(m, eggCol);
    }
    flushBatch(shader, _egg, _eggBatch);
}

void IslandRenderer::drawIncantations(Shader &shader, const GameState &state,
                                      float offsetX, float offsetZ,
                                      const ViewFilters &filters)
{
    (void)filters;
    if (state.incantations.empty()) return;

    InstanceBatch incBatch;
    for (auto &[coord, inc] : state.incantations) {
        if (!inc.active) continue;
        float cx = offsetX + coord.first * ISLAND_SPACING;
        float cz = offsetZ + coord.second * ISLAND_SPACING;
        float islandScale = 0.85f + hashFloat(coord.first, coord.second, 2) * 0.3f;
        float topY = _topY * islandScale;
        float pulse = 0.8f + 0.2f * std::sin(_orbitTime * 3.f + coord.first);
        glm::vec3 glow(0.6f + inc.level * 0.05f, 0.2f, 1.f);

        glm::mat4 m = glm::translate(glm::mat4(1.f), glm::vec3(cx, topY + 0.3f, cz));
        m = glm::scale(m, glm::vec3(0.6f * pulse * islandScale));
        incBatch.add(m, glow);
    }
    if (incBatch.count > 0 && _ruin.uploaded)
        flushBatch(shader, _ruin, incBatch);
}

void IslandRenderer::drawIncantationBursts(Shader &shader, const GameState &state,
                                           float offsetX, float offsetZ,
                                           const ViewFilters &filters)
{
    (void)filters;
    if (state.incantationBursts.empty()) return;

    static constexpr float kDuration = 2.5f;
    InstanceBatch burstBatch;
    for (const auto &burst : state.incantationBursts) {
        float cx = offsetX + burst.x * ISLAND_SPACING;
        float cz = offsetZ + burst.y * ISLAND_SPACING;
        float islandScale = 0.85f + hashFloat(burst.x, burst.y, 2) * 0.3f;
        float topY = _topY * islandScale;
        float t = 1.f - burst.remaining / kDuration;
        float radius = 0.35f + t * 2.f;
        float fade = 1.f - t;
        glm::vec3 col = burst.success
            ? glm::vec3(0.15f, 1.f, 0.35f)
            : glm::vec3(1.f, 0.18f, 0.12f);
        col *= fade * 0.9f + 0.1f;

        glm::mat4 m = glm::translate(glm::mat4(1.f),
            glm::vec3(cx, topY + 0.45f + t * 0.35f, cz));
        m = glm::scale(m, glm::vec3(radius * islandScale));
        burstBatch.add(m, col);

        
        if (t < 0.35f) {
            float inner = 0.55f + (0.35f - t) * 1.2f;
            glm::vec3 innerCol = burst.success
                ? glm::vec3(0.6f, 1.f, 0.7f)
                : glm::vec3(1.f, 0.45f, 0.35f);
            innerCol *= 1.f - t / 0.35f;
            glm::mat4 mi = glm::translate(glm::mat4(1.f), glm::vec3(cx, topY + 0.55f, cz));
            mi = glm::scale(mi, glm::vec3(inner * islandScale));
            burstBatch.add(mi, innerCol);
        }
    }
    if (burstBatch.count > 0 && _asteroids[0].uploaded)
        flushBatch(shader, _asteroids[0], burstBatch);
}

void IslandRenderer::drawBroadcastWaves(Shader &shader, const GameState &state,
                                        float offsetX, float offsetZ,
                                        const ViewFilters &filters)
{
    (void)filters;
    if (state.broadcastBubbles.empty()) return;

    InstanceBatch waveBatch;
    for (const auto &b : state.broadcastBubbles) {
        if (!state.players.count(b.playerId)) continue;
        const Player &p = state.players.at(b.playerId);
        float cx = offsetX + p.x * ISLAND_SPACING;
        float cz = offsetZ + p.y * ISLAND_SPACING;
        float islandScale = 0.85f + hashFloat(p.x, p.y, 2) * 0.3f;
        float topY = _topY * islandScale;
        float t = 1.f - b.remaining / 6.f;
        float radius = 0.3f + t * 1.2f;
        float alpha = 1.f - t;
        glm::vec3 waveCol(0.3f, 0.9f, 1.f);
        waveCol *= alpha;

        glm::mat4 m = glm::translate(glm::mat4(1.f), glm::vec3(cx, topY + 0.8f, cz));
        m = glm::scale(m, glm::vec3(radius * islandScale));
        waveBatch.add(m, waveCol);
    }
    if (waveBatch.count > 0 && _asteroids[0].uploaded)
        flushBatch(shader, _asteroids[0], waveBatch);
}

void IslandRenderer::initFigurants(const GameState &state)
{
    _figurants.clear();
    _figurantMapW = state.mapWidth;
    _figurantMapH = state.mapHeight;
    if (state.mapWidth <= 0 || state.mapHeight <= 0) return;

    const int W = state.mapWidth;
    const int H = state.mapHeight;
    const float offX = -(W - 1) * 0.5f * ISLAND_SPACING;
    const float offZ = -(H - 1) * 0.5f * ISLAND_SPACING;
    int count = std::clamp(W * H / 25, 4, 14);

    for (int i = 0; i < count; ++i) {
        Figurant f;
        float tint = hashFloat(i, i + 7, 900);
        f.color = glm::vec3(0.42f + tint * 0.18f, 0.45f + tint * 0.14f, 0.48f + tint * 0.12f);
        f.idleTimer = hashFloat(i, 0, 500) * 3.f;

        int tx = static_cast<int>(hashFloat(i, 1, 501) * W) % W;
        int ty = static_cast<int>(hashFloat(i, 2, 502) * H) % H;
        float scale = 0.85f + hashFloat(tx, ty, 2) * 0.3f;

        PlayerVisual &v = f.vis;
        v.curTileX = v.lastTileX = tx;
        v.curTileY = v.lastTileY = ty;
        v.curX = offX + tx * ISLAND_SPACING;
        v.curZ = offZ + ty * ISLAND_SPACING;
        v.curTopY = _topY * scale;
        v.yaw = hashFloat(i, 3, 503) * 2.f * (float)M_PI;
        v.targetYaw = v.yaw;
        v.initialized = true;
        _figurants.push_back(f);
    }
}

void IslandRenderer::updateAndDrawFigurants(Shader &playerShader, const GameState &state,
                                            const glm::vec3 &viewPos, float sceneTime,
                                            const glm::mat4 &view, const glm::mat4 &proj,
                                            float offsetX, float offsetZ)
{
    if (!_alien.uploaded || state.mapWidth <= 0) return;

    if (_figurantMapW != state.mapWidth || _figurantMapH != state.mapHeight)
        initFigurants(state);
    if (_figurants.empty()) return;

    const float sizeFactor = mapSizeFactor(state);
    const int W = state.mapWidth;
    const int H = state.mapHeight;

    auto tileWorldX = [&](int gx) { return offsetX + gx * ISLAND_SPACING; };
    auto tileWorldZ = [&](int gy) { return offsetZ + gy * ISLAND_SPACING; };
    auto tileScale  = [&](int gx, int gy) { return 0.85f + hashFloat(gx, gy, 2) * 0.3f; };
    auto tileTopY   = [&](int gx, int gy) { return _topY * tileScale(gx, gy); };

    playerShader.use();
    playerShader.setMat4("view", view);
    playerShader.setMat4("projection", proj);
    playerShader.setVec3("viewPos", viewPos);
    playerShader.setFloat("time", sceneTime);

    static const int DX[] = {0, 1, 0, -1};
    static const int DY[] = {-1, 0, 1, 0};

    int idx = 0;
    for (auto &fig : _figurants) {
        PlayerVisual &v = fig.vis;

        if (!v.initialized) {
            v.curX = tileWorldX(v.curTileX);
            v.curZ = tileWorldZ(v.curTileY);
            v.curTopY = tileTopY(v.curTileX, v.curTileY);
            v.initialized = true;
        }

        if (!v.hopping && v.path.empty()) {
            fig.idleTimer -= _dt;
            if (fig.idleTimer <= 0.f) {
                int dir = static_cast<int>(hashFloat(idx, (int)sceneTime * 10, 600) * 4.f) % 4;
                int nx = (v.curTileX + DX[dir] + W) % W;
                int ny = (v.curTileY + DY[dir] + H) % H;
                if (nx != v.curTileX || ny != v.curTileY) {
                    buildPath(v.curTileX, v.curTileY, nx, ny, W, H, v.path);
                    v.lastTileX = nx;
                    v.lastTileY = ny;
                }
                fig.idleTimer = 2.f + hashFloat(idx, 601, 602) * 5.f;
            }
        }

        while (!v.hopping && !v.path.empty()) {
            PathStep wp = v.path.front();
            float wx = tileWorldX(wp.x), wz = tileWorldZ(wp.y);
            if (wp.teleport) {
                v.curX = wx; v.curZ = wz;
                v.curTopY = tileTopY(wp.x, wp.y);
                v.curTileX = wp.x; v.curTileY = wp.y;
                v.path.pop_front();
                continue;
            }
            v.fromX = v.curX; v.fromZ = v.curZ; v.fromTopY = v.curTopY;
            v.toX = wx; v.toZ = wz; v.toTopY = tileTopY(wp.x, wp.y);
            float dx = v.toX - v.fromX, dz = v.toZ - v.fromZ;
            v.segLen = std::max(std::sqrt(dx * dx + dz * dz), 1e-4f);
            v.t = 0.f;
            v.hopping = true;
            v.targetYaw = std::atan2(dx, dz);
        }

        bool jumping = false;
        if (v.hopping) {
            v.t += (FIGURANT_MOVE_SPEED * _dt) / v.segLen;
            if (v.t >= 1.f) {
                v.curX = v.toX; v.curZ = v.toZ; v.curTopY = v.toTopY;
                v.curTileX = v.path.front().x;
                v.curTileY = v.path.front().y;
                v.path.pop_front();
                v.hopping = false;
                v.t = 1.f;
            } else {
                v.curX = v.fromX + (v.toX - v.fromX) * v.t;
                v.curZ = v.fromZ + (v.toZ - v.fromZ) * v.t;
                v.curTopY = v.fromTopY + (v.toTopY - v.fromTopY) * v.t;
                jumping = true;
            }
        }

        float jumpY = jumping
            ? std::sin(v.t * (float)M_PI) * PLAYER_JUMP_HEIGHT * sizeFactor * 0.8f
            : 0.f;

        float targetWalk = jumping ? 0.85f : 0.15f + 0.1f * std::sin(sceneTime * 2.f + idx);
        v.walkAmount += (targetWalk - v.walkAmount) * std::min(1.f, _dt * 6.f);
        v.walkPhase += _dt * PLAYER_WALK_CADENCE * 0.85f;

        float dyaw = v.targetYaw - v.yaw;
        while (dyaw >  (float)M_PI) dyaw -= 2.f * (float)M_PI;
        while (dyaw < -(float)M_PI) dyaw += 2.f * (float)M_PI;
        float yawStep = PLAYER_TURN_SPEED * 0.7f * _dt;
        if (std::fabs(dyaw) <= yawStep) v.yaw = v.targetYaw;
        else v.yaw += (dyaw > 0.f ? 1.f : -1.f) * yawStep;

        float worldScale = 0.55f * tileScale(v.curTileX, v.curTileY) * sizeFactor;

        glm::mat4 m = glm::translate(glm::mat4(1.f),
            glm::vec3(v.curX, v.curTopY + jumpY, v.curZ));
        m = glm::rotate(m, v.yaw, glm::vec3(0.f, 1.f, 0.f));
        m = glm::scale(m, glm::vec3(worldScale));

        playerShader.setMat4("model", m);
        playerShader.setVec3("teamColor", fig.color);
        playerShader.setFloat("walkPhase", v.walkPhase);
        playerShader.setFloat("walkAmount", v.walkAmount);
        playerShader.setFloat("playerLevel", 1.f);
        _alien.bindAndDraw();
        ++idx;
    }
}

IslandRenderer::~IslandRenderer()
{
    _island.destroy();
    _ruin.destroy();
    for (auto &t : _trees) t.destroy();
    for (auto &a : _asteroids) a.destroy();
    _alien.destroy();
    _egg.destroy();
}
