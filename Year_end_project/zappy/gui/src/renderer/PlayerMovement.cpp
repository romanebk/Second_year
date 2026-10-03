#include "renderer/PlayerMovement.hpp"
#include <algorithm>

float PlayerMovement::orientationToAngle(int orientation)
{
    switch (orientation) {
    case 1: return 180.f;
    case 2: return -90.f;
    case 3: return 0.f;
    case 4: return 90.f;
    default: return 0.f;
    }
}

const char *PlayerMovement::orientationLabel(int orientation)
{
    switch (orientation) {
    case 1: return "Nord";
    case 2: return "Est";
    case 3: return "Sud";
    case 4: return "Ouest";
    default: return "?";
    }
}

float PlayerMovement::wrapDelta(float from, float to, int mapSize)
{
    if (mapSize <= 0)
        return to - from;

    float delta = to - from;
    float half  = mapSize * 0.5f;

    if (delta > half)
        delta -= mapSize;
    else if (delta < -half)
        delta += mapSize;

    return delta;
}

float PlayerMovement::shortestAngleDelta(float from, float to)
{
    float delta = std::fmod(to - from + 540.f, 360.f) - 180.f;
    return delta;
}

float PlayerMovement::moveDuration(const GameState &state)
{
    if (state.timeUnit > 0)
        return std::max(0.2f, 7.f / state.timeUnit); // Fix: 7 / f is the correct formula
    return 0.35f;
}

float PlayerMovement::easeInOut(float t)
{
    t = std::clamp(t, 0.f, 1.f);
    return t * t * (3.f - 2.f * t);
}

void PlayerMovement::startMove(PlayerVisualState &vs, const GameState &state)
{
    vs.startX     = vs.x;
    vs.startY     = vs.y;
    vs.startAngle = vs.angleDeg;

    // Pour éviter qu'ils "sortent de la map" en marchant vers l'extérieur (ex: de 9 à 10)
    // et pour éviter la téléportation instantanée (disparaître/apparaître),
    // on interpole directement vers la vraie coordonnée cible.
    // S'ils passent de la bordure droite (9) à la bordure gauche (0),
    // ils glisseront rapidement à l'intérieur de la carte jusqu'à leur destination.
    vs.targetX = vs.startX + (vs.targetX - vs.startX);
    vs.targetY = vs.startY + (vs.targetY - vs.startY);

    vs.targetAngle = vs.startAngle + shortestAngleDelta(vs.startAngle,
        orientationToAngle(vs.lastServerO));

    vs.progress   = 0.f;
    vs.duration   = moveDuration(state);
    vs.animating  = true;
}

void PlayerMovement::syncPlayer(int id, const Player &player, const GameState &state)
{
    auto &vs = _states[id];

    const bool isNew = (vs.lastServerX < 0);
    const bool moved = !isNew &&
        (player.x != vs.lastServerX || player.y != vs.lastServerY ||
         player.orientation != vs.lastServerO);

    vs.lastServerX = player.x;
    vs.lastServerY = player.y;
    vs.lastServerO = player.orientation;

    if (isNew) {
        vs.x         = (float)player.x;
        vs.y         = (float)player.y;
        vs.angleDeg  = orientationToAngle(player.orientation);
        vs.targetX   = vs.x;
        vs.targetY   = vs.y;
        vs.targetAngle = vs.angleDeg;
        vs.progress  = 1.f;
        vs.animating = false;
        return;
    }

    if (!moved)
        return;

    vs.targetX = (float)player.x;
    vs.targetY = (float)player.y;
    startMove(vs, state);
}

void PlayerMovement::update(float dt, const GameState &state)
{
    for (const auto &[id, player] : state.players)
        syncPlayer(id, player, state);

    for (auto it = _states.begin(); it != _states.end(); ) {
        if (!state.players.count(it->first)) {
            it = _states.erase(it);
            continue;
        }

        PlayerVisualState &vs = it->second;
        if (vs.animating) {
            vs.progress += dt / std::max(vs.duration, 0.001f);
            float t = easeInOut(std::min(vs.progress, 1.f));

            vs.x        = vs.startX + (vs.targetX - vs.startX) * t;
            vs.y        = vs.startY + (vs.targetY - vs.startY) * t;
            vs.angleDeg = vs.startAngle + (vs.targetAngle - vs.startAngle) * t;

            if (vs.progress >= 1.f) {
                vs.x         = vs.lastServerX;
                vs.y         = vs.lastServerY;
                vs.angleDeg  = orientationToAngle(vs.lastServerO);
                vs.animating = false;
                vs.progress  = 1.f;
            }
        }
        ++it;
    }
}

const PlayerVisualState *PlayerMovement::get(int id) const
{
    auto it = _states.find(id);
    if (it == _states.end())
        return nullptr;
    return &it->second;
}
