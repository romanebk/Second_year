#ifndef GAMESTATE_HPP
#define GAMESTATE_HPP

#include <string>
#include <vector>
#include <map>

struct TileResources
{
    int food = 0;
    int linemate = 0;
    int deraumere = 0;
    int sibur = 0;
    int mendiane = 0;
    int phiras = 0;
    int thystame = 0;
};

struct Tile
{
    int x = 0;
    int y = 0;
    TileResources resources;
};

struct PlayerInventory
{
    int food      = 0;
    int linemate  = 0;
    int deraumere = 0;
    int sibur     = 0;
    int mendiane  = 0;
    int phiras    = 0;
    int thystame  = 0;
};

struct Player
{
    int id = 0;
    int x = 0;
    int y = 0;
    int orientation = 0;
    int level = 0;
    std::string teamName;
    PlayerInventory inventory;
};

struct Egg
{
    int id = 0;
    int x = 0;
    int y = 0;
};

struct Incantation
{
    int x = 0;
    int y = 0;
    int level = 0;
    bool active = false;
};

struct GameState
{
    int mapWidth = 0;
    int mapHeight = 0;
    int timeUnit = 0;

    std::vector<std::string> teamNames;
    std::map<int, Player> players;
    std::map<std::pair<int, int>, Tile> tiles;
    std::map<std::pair<int, int>, Incantation> incantations;
    std::map<int, Egg> eggs;

    int lastExpulsion = -1;
    int lastFork = -1;
    std::pair<int, std::string> lastBroadcast = {-1, ""};

    std::pair<int, int> lastResourceDrop   = {-1, -1};
    std::pair<int, int> lastResourcePickup = {-1, -1};

    std::string lastServerMessage;

    std::string winner;
    bool gameOver = false;
};

#endif