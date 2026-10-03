#ifndef GAMESTATE_HPP
#define GAMESTATE_HPP

#include <string>
#include <vector>
#include <map>
#include <deque>
#include <algorithm>
#include <chrono>

enum class PlayerActivity {
    Idle, Moving, Taking, Dropping, Forking, Incanting, Dead
};

enum class GameEventType {
    Spawn, Move, LevelUp, Death, Eject, Fork, Take, Drop,
    Broadcast, EggNew, EggHatch, EggDeath,
    IncantStart, IncantEnd, EndGame, ServerMsg
};

struct GameEvent {
    GameEventType type = GameEventType::Spawn;
    float         time = 0.f;
    int           playerId = -1;
    int           x = -1, y = -1;
    int           level = 0;
    int           resource = -1;
    bool          success = false;
    std::string   text;
};

struct BroadcastBubble {
    int         playerId = -1;
    std::string msg;
    float       remaining = 5.f;
};

struct IncantationBurst {
    int   x = 0, y = 0;
    bool  success = false;
    float remaining = 2.5f;
};

struct ViewFilters {
    bool showResources     = true;
    bool showPlayers       = true;
    bool showEggs          = true;
    bool showBroadcasts    = true;
    bool showIncantations  = true;
};

struct TileResources {
    int food = 0, linemate = 0, deraumere = 0, sibur = 0;
    int mendiane = 0, phiras = 0, thystame = 0;
};

struct Tile {
    int x = 0, y = 0;
    TileResources resources;
};

struct PlayerInventory {
    int food = 0, linemate = 0, deraumere = 0, sibur = 0;
    int mendiane = 0, phiras = 0, thystame = 0;
};

struct Player {
    int               id = 0;
    int               x = 0, y = 0;
    int               orientation = 0;
    int               level = 0;
    std::string       teamName;
    PlayerInventory   inventory;
    PlayerActivity    activity = PlayerActivity::Idle;
    float             activityTimer = 0.f;
    float             incantFlashTimer = 0.f;
    bool              incantFlashSuccess = false;
};

struct Egg {
    int         id = 0;
    int         x = 0, y = 0;
    std::string teamName;
};

struct Incantation {
    int  x = 0, y = 0;
    int  level = 0;
    bool active = false;
};

struct GameState {
    int mapWidth = 0, mapHeight = 0;
    int timeUnit = 0;

    std::vector<std::string>              teamNames;
    std::map<int, Player>                 players;
    std::map<std::pair<int, int>, Tile>   tiles;
    std::map<std::pair<int, int>, Incantation> incantations;
    std::map<int, Egg>                    eggs;
    std::map<std::string, int>            teamForkCounts;

    std::deque<GameEvent>       eventLog;
    std::vector<BroadcastBubble> broadcastBubbles;
    std::vector<IncantationBurst> incantationBursts;

    int lastExpulsion = -1, lastFork = -1;
    std::pair<int, std::string> lastBroadcast = {-1, ""};
    std::pair<int, int> lastResourceDrop = {-1, -1};
    std::pair<int, int> lastResourcePickup = {-1, -1};
    std::string lastServerMessage;

    std::string winner;
    bool gameOver = false;
    bool serverConnected = true;

    float simTime = 0.f;
    int   eventsThisSecond = 0;
    float eventRateTimer = 0.f;
    float eventsPerSecond = 0.f;

    static constexpr std::size_t MAX_EVENTS = 80;

    void pushEvent(const GameEvent &ev) {
        eventLog.push_front(ev);
        while (eventLog.size() > MAX_EVENTS) eventLog.pop_back();
        ++eventsThisSecond;
    }

    void tickSim(float dt) {
        simTime += dt;
        eventRateTimer += dt;
        if (eventRateTimer >= 1.f) {
            eventsPerSecond = (float)eventsThisSecond;
            eventsThisSecond = 0;
            eventRateTimer = 0.f;
        }
        for (auto &b : broadcastBubbles)
            b.remaining -= dt;
        broadcastBubbles.erase(
            std::remove_if(broadcastBubbles.begin(), broadcastBubbles.end(),
                [](const BroadcastBubble &b) { return b.remaining <= 0.f; }),
            broadcastBubbles.end());
        for (auto &burst : incantationBursts)
            burst.remaining -= dt;
        incantationBursts.erase(
            std::remove_if(incantationBursts.begin(), incantationBursts.end(),
                [](const IncantationBurst &b) { return b.remaining <= 0.f; }),
            incantationBursts.end());
        for (auto &[id, p] : players) {
            if (p.incantFlashTimer > 0.f) {
                p.incantFlashTimer -= dt;
                if (p.incantFlashTimer < 0.f) p.incantFlashTimer = 0.f;
            }
            if (p.activityTimer > 0.f) {
                p.activityTimer -= dt;
                if (p.activityTimer <= 0.f && p.activity != PlayerActivity::Incanting)
                    p.activity = PlayerActivity::Idle;
            }
        }
    }
};

#endif
