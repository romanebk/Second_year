#pragma once

#include "state/GameState.hpp"
#include <map>
#include <cmath>

struct PlayerVisualState
{
    float x = 0.f;
    float y = 0.f;
    float angleDeg = 0.f;

    float startX = 0.f;
    float startY = 0.f;
    float startAngle = 0.f;
    float targetX = 0.f;
    float targetY = 0.f;
    float targetAngle = 0.f;

    float progress = 1.f;
    float duration = 0.35f;
    bool  animating = false;

    int lastServerX = -1;
    int lastServerY = -1;
    int lastServerO = 0;
};

class PlayerMovement
{
public:
    void update(float dt, const GameState &state);

    const PlayerVisualState *get(int id) const;
    const std::map<int, PlayerVisualState> &all() const { return _states; }

    static float orientationToAngle(int orientation);
    static const char *orientationLabel(int orientation);

private:
    static float wrapDelta(float from, float to, int mapSize);
    static float shortestAngleDelta(float from, float to);
    static float moveDuration(const GameState &state);
    static float easeInOut(float t);

    void syncPlayer(int id, const Player &player, const GameState &state);
    void startMove(PlayerVisualState &vs, const GameState &state);

    std::map<int, PlayerVisualState> _states;
};
