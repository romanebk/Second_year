#pragma once

#include <GL/glew.h>
#include <glm/glm.hpp>
#include <SFML/Graphics.hpp>
#include <optional>
#include "state/GameState.hpp"
#include "renderer/Shader.hpp"
#include "renderer/Camera.hpp"
#include "renderer/PlayerMovement.hpp"

class EntityRenderer
{
public:
    EntityRenderer() = default;
    ~EntityRenderer();

    void init();
    void update(float dt, const GameState &state);
    void draw(Shader &shader, const GameState &state, int selectedId = -1);
    void drawOverlays(sf::RenderWindow &window, const GameState &state,
                      const Camera &camera, const sf::Font &font,
                      unsigned winW, unsigned winH);

    const PlayerMovement &movement() const { return _movement; }
    PlayerMovement       &movement()       { return _movement; }

    std::optional<int> pickPlayer(int mouseX, int mouseY,
                                  const Camera &camera,
                                  const GameState &state,
                                  unsigned winW, unsigned winH) const;

    static glm::vec3 teamColor(const std::string &teamName,
                               const std::vector<std::string> &teamNames);

    static constexpr float TILE_SIZE    = 1.0f;
    static constexpr float PLAYER_HEIGHT = 0.55f;
    static constexpr float BASE_SCALE   = 0.32f;

private:
    void buildCube();

    GLuint _vao = 0;
    GLuint _vbo = 0;
    bool   _ready = false;
    int    _vertexCount = 0;

    PlayerMovement _movement;
};
