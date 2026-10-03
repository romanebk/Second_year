#pragma once

#include "../state/GameState.hpp"

struct UiState {
    int               selectedPlayerId = -1;
    std::pair<int, int> selectedTile   = {-1, -1};
    int               followPlayerId   = -1;
    std::string       followTeam;
    ViewFilters       filters;
    int               timeSpeed          = 1;
    bool              paused             = false;
    bool              showDebug          = true;
    bool              showMinimap        = true;
    bool              showEventFeed      = true;
    bool              showScoreboard     = true;
    int               baseTimeUnit       = 100;
    float             endgameAnimTime    = 0.f;
    std::vector<int>  playerIdList;
    int               spectatorIndex     = 0;
};
