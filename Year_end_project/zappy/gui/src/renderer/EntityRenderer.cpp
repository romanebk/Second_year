#include "renderer/EntityRenderer.hpp"
#include <glm/gtc/matrix_transform.hpp>
#include <cmath>
#include <iostream>
#include <algorithm>

static const float PLAYER_CUBE[] = {
    -0.5f,-0.5f, 0.5f,   0.f, 0.f, 1.f,
     0.5f,-0.5f, 0.5f,   0.f, 0.f, 1.f,
     0.5f, 0.5f, 0.5f,   0.f, 0.f, 1.f,
     0.5f, 0.5f, 0.5f,   0.f, 0.f, 1.f,
    -0.5f, 0.5f, 0.5f,   0.f, 0.f, 1.f,
    -0.5f,-0.5f, 0.5f,   0.f, 0.f, 1.f,

     0.5f,-0.5f,-0.5f,   0.f, 0.f,-1.f,
    -0.5f,-0.5f,-0.5f,   0.f, 0.f,-1.f,
    -0.5f, 0.5f,-0.5f,   0.f, 0.f,-1.f,
    -0.5f, 0.5f,-0.5f,   0.f, 0.f,-1.f,
     0.5f, 0.5f,-0.5f,   0.f, 0.f,-1.f,
     0.5f,-0.5f,-0.5f,   0.f, 0.f,-1.f,

    -0.5f,-0.5f,-0.5f,  -1.f, 0.f, 0.f,
    -0.5f,-0.5f, 0.5f,  -1.f, 0.f, 0.f,
    -0.5f, 0.5f, 0.5f,  -1.f, 0.f, 0.f,
    -0.5f, 0.5f, 0.5f,  -1.f, 0.f, 0.f,
    -0.5f, 0.5f,-0.5f,  -1.f, 0.f, 0.f,
    -0.5f,-0.5f,-0.5f,  -1.f, 0.f, 0.f,

     0.5f,-0.5f, 0.5f,   1.f, 0.f, 0.f,
     0.5f,-0.5f,-0.5f,   1.f, 0.f, 0.f,
     0.5f, 0.5f,-0.5f,   1.f, 0.f, 0.f,
     0.5f, 0.5f,-0.5f,   1.f, 0.f, 0.f,
     0.5f, 0.5f, 0.5f,   1.f, 0.f, 0.f,
     0.5f,-0.5f, 0.5f,   1.f, 0.f, 0.f,

    -0.5f, 0.5f, 0.5f,   0.f, 1.f, 0.f,
     0.5f, 0.5f, 0.5f,   0.f, 1.f, 0.f,
     0.5f, 0.5f,-0.5f,   0.f, 1.f, 0.f,
     0.5f, 0.5f,-0.5f,   0.f, 1.f, 0.f,
    -0.5f, 0.5f,-0.5f,   0.f, 1.f, 0.f,
    -0.5f, 0.5f, 0.5f,   0.f, 1.f, 0.f,

    -0.5f,-0.5f,-0.5f,   0.f,-1.f, 0.f,
     0.5f,-0.5f,-0.5f,   0.f,-1.f, 0.f,
     0.5f,-0.5f, 0.5f,   0.f,-1.f, 0.f,
     0.5f,-0.5f, 0.5f,   0.f,-1.f, 0.f,
    -0.5f,-0.5f, 0.5f,   0.f,-1.f, 0.f,
    -0.5f,-0.5f,-0.5f,   0.f,-1.f, 0.f,
};

static const glm::vec3 TEAM_PALETTE[] = {
    {0.95f, 0.95f, 0.98f},
    {0.95f, 0.45f, 0.10f},
    {0.20f, 0.75f, 0.95f},
    {0.85f, 0.20f, 0.55f},
    {0.45f, 0.90f, 0.35f},
    {0.70f, 0.35f, 0.95f},
    {0.95f, 0.85f, 0.20f},
    {0.35f, 0.95f, 0.80f},
};
static constexpr int TEAM_PALETTE_SIZE =
    (int)(sizeof(TEAM_PALETTE) / sizeof(TEAM_PALETTE[0]));

glm::vec3 EntityRenderer::teamColor(const std::string &teamName,
                                    const std::vector<std::string> &teamNames)
{
    for (size_t i = 0; i < teamNames.size(); ++i) {
        if (teamNames[i] == teamName)
            return TEAM_PALETTE[i % TEAM_PALETTE_SIZE];
    }

    unsigned hash = 5381;
    for (char c : teamName)
        hash = ((hash << 5) + hash) + (unsigned char)c;

    return TEAM_PALETTE[hash % TEAM_PALETTE_SIZE];
}

void EntityRenderer::buildCube()
{
    _vertexCount = 36;

    glGenVertexArrays(1, &_vao);
    glBindVertexArray(_vao);

    glGenBuffers(1, &_vbo);
    glBindBuffer(GL_ARRAY_BUFFER, _vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(PLAYER_CUBE), PLAYER_CUBE, GL_STATIC_DRAW);

    const GLsizei stride = 6 * sizeof(float);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, stride, (void *)0);
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, stride, (void *)(3 * sizeof(float)));
    glEnableVertexAttribArray(1);

    glBindVertexArray(0);
}

void EntityRenderer::init()
{
    if (_ready)
        return;
    buildCube();
    _ready = true;
    std::cout << "[EntityRenderer] Cubes joueurs initialises.\n";
}

void EntityRenderer::update(float dt, const GameState &state)
{
    _movement.update(dt, state);
}

void EntityRenderer::draw(Shader &shader, const GameState &state, int selectedId)
{
    if (!_ready || state.mapWidth == 0)
        return;

    const float offsetX = -(state.mapWidth  - 1) * 0.5f * TILE_SIZE;
    const float offsetZ = -(state.mapHeight - 1) * 0.5f * TILE_SIZE;

    glBindVertexArray(_vao);

    for (const auto &[id, player] : state.players) {
        const PlayerVisualState *vs = _movement.get(id);
        if (!vs)
            continue;

        float wx = offsetX + vs->x * TILE_SIZE;
        float wz = offsetZ + vs->y * TILE_SIZE;
        float scale = BASE_SCALE + (player.level - 1) * 0.05f;

        glm::mat4 baseModel = glm::translate(glm::mat4(1.f), {wx, 0.5f, wz});
        baseModel = glm::rotate(baseModel, glm::radians(vs->angleDeg), glm::vec3(0.f, 1.f, 0.f));

        glm::vec3 teamCol = teamColor(player.teamName, state.teamNames);
        glm::vec3 skinCol = glm::vec3(1.0f, 0.8f, 0.6f); // Couleur de peau "humanoïde"

        shader.setFloat("selected", id == selectedId ? 1.f : 0.f);
        shader.setFloat("levelGlow", std::min(player.level / 8.f, 1.f));

        // Animation de marche basée sur le mouvement (balance bras/jambes)
        float walkCycle = 0.f;
        if (vs->animating) {
            walkCycle = std::sin(vs->progress * 3.14159f * 4.f); 
        }

        // 1. Jambe gauche
        glm::mat4 legL = glm::translate(baseModel, glm::vec3(-0.15f * scale, 0.25f * scale, 0.f));
        legL = glm::rotate(legL, -walkCycle * 0.5f, glm::vec3(1.f, 0.f, 0.f));
        legL = glm::scale(legL, glm::vec3(0.18f * scale, 0.5f * scale, 0.18f * scale));
        shader.setMat4("model", legL);
        shader.setVec3("teamColor", teamCol * 0.5f); // Pantalon (équipe assombrie)
        glDrawArrays(GL_TRIANGLES, 0, _vertexCount);

        // 2. Jambe droite
        glm::mat4 legR = glm::translate(baseModel, glm::vec3(0.15f * scale, 0.25f * scale, 0.f));
        legR = glm::rotate(legR, walkCycle * 0.5f, glm::vec3(1.f, 0.f, 0.f));
        legR = glm::scale(legR, glm::vec3(0.18f * scale, 0.5f * scale, 0.18f * scale));
        shader.setMat4("model", legR);
        shader.setVec3("teamColor", teamCol * 0.5f);
        glDrawArrays(GL_TRIANGLES, 0, _vertexCount);

        // 3. Torse
        glm::mat4 torso = glm::translate(baseModel, glm::vec3(0.f, 0.8f * scale, 0.f));
        torso = glm::scale(torso, glm::vec3(0.5f * scale, 0.6f * scale, 0.25f * scale));
        shader.setMat4("model", torso);
        shader.setVec3("teamColor", teamCol); // T-shirt équipe
        glDrawArrays(GL_TRIANGLES, 0, _vertexCount);

        // 4. Bras gauche
        glm::mat4 armL = glm::translate(baseModel, glm::vec3(-0.35f * scale, 1.0f * scale, 0.f)); // Épaule
        armL = glm::rotate(armL, walkCycle * 0.5f, glm::vec3(1.f, 0.f, 0.f)); // Swing épaule
        armL = glm::translate(armL, glm::vec3(0.f, -0.2f * scale, 0.f));
        armL = glm::scale(armL, glm::vec3(0.16f * scale, 0.5f * scale, 0.16f * scale));
        shader.setMat4("model", armL);
        shader.setVec3("teamColor", skinCol); // Bras nu
        glDrawArrays(GL_TRIANGLES, 0, _vertexCount);

        // 5. Bras droit
        glm::mat4 armR = glm::translate(baseModel, glm::vec3(0.35f * scale, 1.0f * scale, 0.f));
        armR = glm::rotate(armR, -walkCycle * 0.5f, glm::vec3(1.f, 0.f, 0.f));
        armR = glm::translate(armR, glm::vec3(0.f, -0.2f * scale, 0.f));
        armR = glm::scale(armR, glm::vec3(0.16f * scale, 0.5f * scale, 0.16f * scale));
        shader.setMat4("model", armR);
        shader.setVec3("teamColor", skinCol);
        glDrawArrays(GL_TRIANGLES, 0, _vertexCount);

        // 6. Tête
        glm::mat4 head = glm::translate(baseModel, glm::vec3(0.f, 1.3f * scale, 0.f));
        head = glm::scale(head, glm::vec3(0.4f * scale));
        shader.setMat4("model", head);
        shader.setVec3("teamColor", skinCol);
        glDrawArrays(GL_TRIANGLES, 0, _vertexCount);
    }

    // --- Rendu des Oeufs (Eggs) ---
    for (const auto &[eggId, egg] : state.eggs) {
        float wx = offsetX + egg.x * TILE_SIZE;
        float wz = offsetZ + egg.y * TILE_SIZE;
        float scale = BASE_SCALE * 0.4f; // Plus petit qu'un joueur

        glm::mat4 model = glm::translate(glm::mat4(1.f), {wx, 0.55f, wz});
        model = glm::scale(model, glm::vec3(scale, scale * 1.2f, scale));

        shader.setMat4("model", model);
        shader.setVec3("teamColor", glm::vec3(1.0f, 0.95f, 0.8f)); // Couleur coquille d'oeuf
        shader.setFloat("selected", 0.f);
        shader.setFloat("levelGlow", 0.f);

        glDrawArrays(GL_TRIANGLES, 0, _vertexCount);
    }

    glBindVertexArray(0);
}

std::optional<int> EntityRenderer::pickPlayer(int mouseX, int mouseY,
                                              const Camera &camera,
                                              const GameState &state,
                                              unsigned winW, unsigned winH) const
{
    if (state.mapWidth == 0 || state.players.empty())
        return std::nullopt;

    float aspect = (float)winW / (float)winH;
    const float offsetX = -(state.mapWidth  - 1) * 0.5f * TILE_SIZE;
    const float offsetZ = -(state.mapHeight - 1) * 0.5f * TILE_SIZE;

    int   bestId   = -1;
    float bestDist = 48.f;

    for (const auto &[id, player] : state.players) {
        const PlayerVisualState *vs = _movement.get(id);
        if (!vs)
            continue;

        glm::vec4 worldPos(
            offsetX + vs->x * TILE_SIZE,
            PLAYER_HEIGHT,
            offsetZ + vs->y * TILE_SIZE,
            1.f
        );

        glm::vec4 clip = camera.getProjection(aspect) * camera.getView() * worldPos;
        if (clip.w <= 0.f)
            continue;

        glm::vec3 ndc = glm::vec3(clip) / clip.w;
        if (ndc.x < -1.2f || ndc.x > 1.2f || ndc.y < -1.2f || ndc.y > 1.2f)
            continue;

        float sx = ( ndc.x * 0.5f + 0.5f) * (float)winW;
        float sy = (-ndc.y * 0.5f + 0.5f) * (float)winH;

        float dx = sx - (float)mouseX;
        float dy = sy - (float)mouseY;
        float dist = std::sqrt(dx * dx + dy * dy);

        if (dist < bestDist) {
            bestDist = dist;
            bestId   = id;
        }
    }

    if (bestId < 0)
        return std::nullopt;
    return bestId;
}

EntityRenderer::~EntityRenderer()
{
    if (_vbo) glDeleteBuffers(1, &_vbo);
    if (_vao) glDeleteVertexArrays(1, &_vao);
}

void EntityRenderer::drawOverlays(sf::RenderWindow &window, const GameState &state,
                                  const Camera &camera, const sf::Font &font,
                                  unsigned winW, unsigned winH)
{
    if (state.mapWidth == 0 || state.players.empty()) return;

    float aspect = (float)winW / (float)winH;
    const float offsetX = -(state.mapWidth  - 1) * 0.5f * TILE_SIZE;
    const float offsetZ = -(state.mapHeight - 1) * 0.5f * TILE_SIZE;

    for (const auto &[id, player] : state.players) {
        const PlayerVisualState *vs = _movement.get(id);
        if (!vs) continue;

        glm::vec4 worldPos(
            offsetX + vs->x * TILE_SIZE,
            PLAYER_HEIGHT + 0.5f, // Juste au-dessus du joueur
            offsetZ + vs->y * TILE_SIZE,
            1.f
        );

        glm::vec4 clip = camera.getProjection(aspect) * camera.getView() * worldPos;
        if (clip.w <= 0.f) continue; // Derrière la caméra

        glm::vec3 ndc = glm::vec3(clip) / clip.w;
        if (ndc.x < -1.f || ndc.x > 1.f || ndc.y < -1.f || ndc.y > 1.f) continue; // Hors écran

        float sx = ( ndc.x * 0.5f + 0.5f) * (float)winW;
        float sy = (-ndc.y * 0.5f + 0.5f) * (float)winH;

        // Texte principal (Equipe, ID, Level)
        sf::Text label;
        label.setFont(font);
        label.setString("P" + std::to_string(id) + " (Lvl " + std::to_string(player.level) + ")");
        label.setCharacterSize(12);
        
        // Couleur selon l'équipe
        glm::vec3 color = teamColor(player.teamName, state.teamNames);
        label.setFillColor(sf::Color((sf::Uint8)(color.r * 255), (sf::Uint8)(color.g * 255), (sf::Uint8)(color.b * 255)));
        label.setOutlineColor(sf::Color::Black);
        label.setOutlineThickness(1.5f);

        auto bounds = label.getLocalBounds();
        label.setPosition(sx - bounds.width * 0.5f, sy - bounds.height);

        window.draw(label);

        // Indicateur d'Incantation
        auto incantIt = state.incantations.find({player.x, player.y});
        if (incantIt != state.incantations.end() && incantIt->second.active) {
            sf::Text incantText;
            incantText.setFont(font);
            incantText.setString("Incanting...");
            incantText.setCharacterSize(10);
            incantText.setFillColor(sf::Color::Magenta);
            incantText.setOutlineColor(sf::Color::Black);
            incantText.setOutlineThickness(1.f);
            auto b2 = incantText.getLocalBounds();
            incantText.setPosition(sx - b2.width * 0.5f, sy - bounds.height - 15.f);
            window.draw(incantText);
        }

        // Indicateur de Broadcast
        if (state.lastBroadcast.first == id) {
            sf::Text broadcastText;
            broadcastText.setFont(font);
            broadcastText.setString("Broadcast!");
            broadcastText.setCharacterSize(10);
            broadcastText.setFillColor(sf::Color::Cyan);
            broadcastText.setOutlineColor(sf::Color::Black);
            broadcastText.setOutlineThickness(1.f);
            auto b3 = broadcastText.getLocalBounds();
            broadcastText.setPosition(sx - b3.width * 0.5f, sy + 5.f);
            window.draw(broadcastText);
        }
    }
}
