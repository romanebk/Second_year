#include "../../include/game/BroadcastSystem.hpp"
#include "../../include/protocol/AIProtocol.hpp"
#include <cmath>

int BroadcastSystem::computeDirection(const Position &from, const Position &to,
                                       Orientation receiverOrientation, Map &map)
{
    if (from == to)
        return 0;

    int dx = to.x - from.x;
    int dy = to.y - from.y;

    int wrapDx = map.getWidth() - std::abs(dx);
    if (std::abs(wrapDx) < std::abs(dx))
        dx = (dx > 0) ? -wrapDx : wrapDx;

    int wrapDy = map.getHeight() - std::abs(dy);
    if (std::abs(wrapDy) < std::abs(dy))
        dy = (dy > 0) ? -wrapDy : wrapDy;

    double angle = std::atan2(dy, dx);

    int dir = 0;
    switch (receiverOrientation) {
        case Orientation::NORTH:
            if (angle > -M_PI / 4 && angle <= M_PI / 4) dir = 1;
            else if (angle > M_PI / 4 && angle <= 3 * M_PI / 4) dir = 2;
            else if (angle > -3 * M_PI / 4 && angle <= -M_PI / 4) dir = 4;
            else dir = 3;
            break;
        case Orientation::EAST:
            if (angle > -M_PI / 4 && angle <= M_PI / 4) dir = 3;
            else if (angle > M_PI / 4 && angle <= 3 * M_PI / 4) dir = 4;
            else if (angle > -3 * M_PI / 4 && angle <= -M_PI / 4) dir = 2;
            else dir = 1;
            break;
        case Orientation::SOUTH:
            if (angle > -M_PI / 4 && angle <= M_PI / 4) dir = 5;
            else if (angle > M_PI / 4 && angle <= 3 * M_PI / 4) dir = 6;
            else if (angle > -3 * M_PI / 4 && angle <= -M_PI / 4) dir = 8;
            else dir = 7;
            break;
        case Orientation::WEST:
            if (angle > -M_PI / 4 && angle <= M_PI / 4) dir = 7;
            else if (angle > M_PI / 4 && angle <= 3 * M_PI / 4) dir = 8;
            else if (angle > -3 * M_PI / 4 && angle <= -M_PI / 4) dir = 6;
            else dir = 5;
            break;
    }

    return dir;
}

void BroadcastSystem::broadcast(Map &map, Player &sender, const std::string &msg,
                                 const std::vector<Player *> &allPlayers)
{
    (void)map;
    (void)sender;
    (void)msg;
    (void)allPlayers;
}
