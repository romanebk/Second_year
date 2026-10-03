#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <map>
#include <deque>
#include <string>
#include <vector>
#include "../core/ThemeMode.hpp"
#include "../state/GameState.hpp"
#include "Shader.hpp"
#include "Camera.hpp"
#include "ObjLoader.hpp"
#include "ResourceRenderer.hpp"
#include "Frustum.hpp"

class IslandRenderer {
public:
    IslandRenderer() = default;
    ~IslandRenderer();

    
    
    struct PathStep { int x; int y; bool teleport; };

    void init(ThemeMode theme);
    void update(float dt);

    void draw(Shader &instancedShader, Shader &resourceShader,
              Shader &playerShader,
              const GameState &state, const Camera &camera, float aspect,
              ResourceRenderer &resourceRenderer,
              const ViewFilters &filters = ViewFilters{},
              int *outVisibleTiles = nullptr);

    static constexpr float ISLAND_SPACING = 2.4f;

    static constexpr float ISLAND_CULL_RADIUS = 2.2f;

    
    
    static constexpr float PLAYER_MOVE_SPEED = 0.9f;
    
    static constexpr float PLAYER_TURN_SPEED = 5.0f;
    
    static constexpr float PLAYER_JUMP_HEIGHT = 0.55f;
    
    static constexpr float PLAYER_WALK_CADENCE = 9.0f;
    static constexpr float FIGURANT_MOVE_SPEED = 0.45f;
    
    static constexpr float PLAYER_TELEPORT_DIST = 2.5f * ISLAND_SPACING;

    static glm::vec3 teamColor(const std::string &team);

private:
    static unsigned hashTile(int x, int y, unsigned salt);
    static float hashFloat(int x, int y, unsigned salt);

    struct InstanceBatch {
        std::vector<float> matrices;
        std::vector<float> colors;
        int count = 0;

        void clear() { matrices.clear(); colors.clear(); count = 0; }
        void add(const glm::mat4 &m, const glm::vec3 &color);
    };

    void flushBatch(Shader &shader, ObjModel &model, InstanceBatch &batch);

    
    struct PlayerVisual {
        float curX = 0.f, curZ = 0.f;       
        float curTopY = 0.f;                 
        float fromX = 0.f, fromZ = 0.f, fromTopY = 0.f; 
        float toX = 0.f, toZ = 0.f, toTopY = 0.f;       
        float t = 1.f;                       
        float segLen = 0.f;                  
        bool  hopping = false;               
        int   curTileX = 0, curTileY = 0;    
        int   lastTileX = 0, lastTileY = 0;  
        std::deque<PathStep> path;           
        float yaw = 0.f, targetYaw = 0.f;    
        float walkPhase = 0.f;               
        float walkAmount = 0.f;              
        bool  initialized = false;
        bool  seen = false;                  
    };

    void buildAlienModel();
    void buildEggModel();
    void updateAndDrawPlayers(Shader &playerShader, const GameState &state,
                              const glm::vec3 &viewPos, float sceneTime,
                              const glm::mat4 &view, const glm::mat4 &proj,
                              float offsetX, float offsetZ,
                              const ViewFilters &filters);
    void drawEggs(Shader &shader, const GameState &state,
                  float offsetX, float offsetZ, const ViewFilters &filters);
    void drawIncantations(Shader &shader, const GameState &state,
                          float offsetX, float offsetZ, const ViewFilters &filters);
    void drawIncantationBursts(Shader &shader, const GameState &state,
                               float offsetX, float offsetZ,
                               const ViewFilters &filters);
    void drawBroadcastWaves(Shader &shader, const GameState &state,
                            float offsetX, float offsetZ, const ViewFilters &filters);
    void initFigurants(const GameState &state);
    void updateAndDrawFigurants(Shader &playerShader, const GameState &state,
                                const glm::vec3 &viewPos, float sceneTime,
                                const glm::mat4 &view, const glm::mat4 &proj,
                                float offsetX, float offsetZ);
    static float orientationToYaw(int orientation);

    struct Figurant {
        PlayerVisual vis;
        float        idleTimer = 0.f;
        glm::vec3    color { 0.55f, 0.58f, 0.62f };
    };

    std::vector<Figurant> _figurants;
    int _figurantMapW = 0;
    int _figurantMapH = 0;

    ObjModel _alien;
    std::map<int, PlayerVisual> _playerVisuals;

    ObjModel _egg;
    InstanceBatch _eggBatch;

    float _dt = 0.f;

    ThemeMode _theme = ThemeMode::Yavin;
    bool      _ready = false;

    ObjModel _island;
    ObjModel _ruin;
    ObjModel _trees[2];
    int      _treeCount = 0;
    ObjModel _asteroids[2];

    glm::vec3 _islandColor { 0.6f, 0.6f, 0.6f };
    glm::vec3 _ruinColor   { 0.5f, 0.5f, 0.5f };
    glm::vec3 _treeColor   { 0.3f, 0.5f, 0.3f };
    glm::vec3 _asteroidColor { 0.45f, 0.42f, 0.4f };

    float _topY = 0.42f;
    float _orbitTime = 0.f;

    Frustum _frustum;

    InstanceBatch _islandBatch;
    InstanceBatch _ruinBatch;
    InstanceBatch _treeBatch[2];
    InstanceBatch _asteroidBatch[2];
};
