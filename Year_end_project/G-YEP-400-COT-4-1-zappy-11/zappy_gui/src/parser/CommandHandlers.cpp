#include "CommandHandlers.hpp"
#include <iostream>

namespace CommandHandlers {

static int extractId(const std::string &idstr) {
    if (idstr.empty()) return -1;
    try {
        if (idstr[0] == '#')
            return std::stoi(idstr.substr(1));
        return std::stoi(idstr);
    } catch (...) {
        std::cerr << "[extractId] invalide: '" << idstr << "'\n";
        return -1;
    }
}

static void logEvent(GameState &state, GameEventType type,
                     int pid = -1, int x = -1, int y = -1,
                     int level = 0, int resource = -1,
                     bool success = false, const std::string &text = "") {
    GameEvent ev;
    ev.type     = type;
    ev.time     = state.simTime;
    ev.playerId = pid;
    ev.x        = x;
    ev.y        = y;
    ev.level    = level;
    ev.resource = resource;
    ev.success  = success;
    ev.text     = text;
    state.pushEvent(ev);
}

static void setActivity(GameState &state, int id, PlayerActivity act, float duration = 1.5f) {
    if (!state.players.count(id)) return;
    state.players[id].activity      = act;
    state.players[id].activityTimer = duration;
}

void handleMsz(std::istringstream &ss, GameState &state) {
    ss >> state.mapWidth >> state.mapHeight;
}

void handleSgt(std::istringstream &ss, GameState &state) {
    ss >> state.timeUnit;
}

void handleSst(std::istringstream &ss, GameState &state) {
    ss >> state.timeUnit;
}

void handleTna(std::istringstream &ss, GameState &state) {
    std::string name;
    ss >> name;
    state.teamNames.push_back(name);
}

void handleBct(std::istringstream &ss, GameState &state) {
    Tile t;
    ss >> t.x >> t.y
       >> t.resources.food >> t.resources.linemate >> t.resources.deraumere
       >> t.resources.sibur >> t.resources.mendiane >> t.resources.phiras
       >> t.resources.thystame;
    state.tiles[{t.x, t.y}] = t;
}

void handlePnw(std::istringstream &ss, GameState &state) {
    std::string idstr, team;
    int x, y, o, l;
    ss >> idstr >> x >> y >> o >> l >> team;
    int id = extractId(idstr);
    if (id == -1) return;
    Player p;
    p.id = id; p.x = x; p.y = y; p.orientation = o; p.level = l; p.teamName = team;
    state.players[id] = p;
    logEvent(state, GameEventType::Spawn, id, x, y, l, -1, false, team);
}

void handlePpo(std::istringstream &ss, GameState &state) {
    std::string idstr;
    int x, y, o;
    ss >> idstr >> x >> y >> o;
    int id = extractId(idstr);
    if (id == -1) return;
    if (state.players.count(id)) {
        state.players[id].x = x;
        state.players[id].y = y;
        state.players[id].orientation = o;
        setActivity(state, id, PlayerActivity::Moving, 0.8f);
        logEvent(state, GameEventType::Move, id, x, y);
    }
}

void handlePlv(std::istringstream &ss, GameState &state) {
    std::string idstr;
    int l;
    ss >> idstr >> l;
    int id = extractId(idstr);
    if (id == -1) return;
    if (state.players.count(id)) {
        state.players[id].level = l;
        logEvent(state, GameEventType::LevelUp, id, -1, -1, l);
    }
}

void handlePdi(std::istringstream &ss, GameState &state) {
    std::string idstr;
    ss >> idstr;
    int id = extractId(idstr);
    if (id == -1) return;
    if (state.players.count(id)) {
        setActivity(state, id, PlayerActivity::Dead, 0.f);
        logEvent(state, GameEventType::Death, id);
    }
    state.players.erase(id);
}

void handlePex(std::istringstream &ss, GameState &state) {
    std::string idstr;
    ss >> idstr;
    int id = extractId(idstr);
    if (id == -1) return;
    state.lastExpulsion = id;
    logEvent(state, GameEventType::Eject, id);
}

void handlePbc(std::istringstream &ss, GameState &state) {
    std::string idstr, msg;
    ss >> idstr;
    std::getline(ss, msg);
    if (!msg.empty() && msg[0] == ' ') msg = msg.substr(1);
    int id = extractId(idstr);
    if (id == -1) return;
    state.lastBroadcast = {id, msg};
    BroadcastBubble b;
    b.playerId = id; b.msg = msg; b.remaining = 6.f;
    state.broadcastBubbles.push_back(b);
    logEvent(state, GameEventType::Broadcast, id, -1, -1, 0, -1, false, msg);
}

void handlePfk(std::istringstream &ss, GameState &state) {
    std::string idstr;
    ss >> idstr;
    int id = extractId(idstr);
    if (id == -1) return;
    state.lastFork = id;
    if (state.players.count(id)) {
        setActivity(state, id, PlayerActivity::Forking, 2.f);
        state.teamForkCounts[state.players[id].teamName]++;
    }
    logEvent(state, GameEventType::Fork, id);
}

void handlePin(std::istringstream &ss, GameState &state) {
    std::string idstr;
    int x, y;
    ss >> idstr >> x >> y;
    int id = extractId(idstr);
    if (id == -1) return;
    if (state.players.count(id)) {
        PlayerInventory &inv = state.players[id].inventory;
        ss >> inv.food >> inv.linemate >> inv.deraumere >> inv.sibur
           >> inv.mendiane >> inv.phiras >> inv.thystame;
        state.players[id].x = x;
        state.players[id].y = y;
    }
}

void handlePdr(std::istringstream &ss, GameState &state) {
    std::string idstr;
    int resource;
    ss >> idstr >> resource;
    int id = extractId(idstr);
    if (id == -1) return;
    state.lastResourceDrop = {id, resource};
    setActivity(state, id, PlayerActivity::Dropping, 1.f);
    logEvent(state, GameEventType::Drop, id, -1, -1, 0, resource);
}

void handlePgt(std::istringstream &ss, GameState &state) {
    std::string idstr;
    int resource;
    ss >> idstr >> resource;
    int id = extractId(idstr);
    if (id == -1) return;
    state.lastResourcePickup = {id, resource};
    setActivity(state, id, PlayerActivity::Taking, 1.f);
    logEvent(state, GameEventType::Take, id, -1, -1, 0, resource);
}

void handlePic(std::istringstream &ss, GameState &state) {
    int x, y, l;
    ss >> x >> y >> l;
    Incantation inc;
    inc.x = x; inc.y = y; inc.level = l; inc.active = true;
    state.incantations[{x, y}] = inc;
    for (auto &[id, p] : state.players)
        if (p.x == x && p.y == y)
            setActivity(state, id, PlayerActivity::Incanting, 30.f);
    logEvent(state, GameEventType::IncantStart, -1, x, y, l);
}

void handlePie(std::istringstream &ss, GameState &state) {
    int x, y, r;
    ss >> x >> y >> r;
    const bool success = (r == 1);
    state.incantations.erase({x, y});
    for (auto &[id, p] : state.players) {
        if (p.x != x || p.y != y) continue;
        if (p.activity == PlayerActivity::Incanting)
            p.activity = PlayerActivity::Idle;
        p.incantFlashTimer = 2.5f;
        p.incantFlashSuccess = success;
    }
    IncantationBurst burst;
    burst.x = x; burst.y = y; burst.success = success; burst.remaining = 2.5f;
    state.incantationBursts.push_back(burst);
    logEvent(state, GameEventType::IncantEnd, -1, x, y, 0, -1, success);
}

void handleEnw(std::istringstream &ss, GameState &state) {
    std::string eidstr, nidstr;
    int x, y;
    ss >> eidstr >> nidstr >> x >> y;
    int eid = extractId(eidstr);
    int nid = extractId(nidstr);
    if (eid == -1) return;
    Egg e;
    e.id = eid; e.x = x; e.y = y;
    if (state.players.count(nid))
        e.teamName = state.players[nid].teamName;
    state.eggs[eid] = e;
    logEvent(state, GameEventType::EggNew, nid, x, y);
}

void handleEbo(std::istringstream &ss, GameState &state) {
    std::string eidstr;
    ss >> eidstr;
    int eid = extractId(eidstr);
    if (eid == -1) return;
    if (state.eggs.count(eid))
        logEvent(state, GameEventType::EggHatch, -1,
                 state.eggs[eid].x, state.eggs[eid].y);
    state.eggs.erase(eid);
}

void handleEdi(std::istringstream &ss, GameState &state) {
    std::string eidstr;
    ss >> eidstr;
    int eid = extractId(eidstr);
    if (eid == -1) return;
    if (state.eggs.count(eid))
        logEvent(state, GameEventType::EggDeath, -1,
                 state.eggs[eid].x, state.eggs[eid].y);
    state.eggs.erase(eid);
}

void handleSeg(std::istringstream &ss, GameState &state) {
    ss >> state.winner;
    state.gameOver = true;
    logEvent(state, GameEventType::EndGame, -1, -1, -1, 0, -1, false, state.winner);
}

void handleSmg(std::istringstream &ss, GameState &state) {
    std::string msg;
    std::getline(ss, msg);
    if (!msg.empty() && msg[0] == ' ') msg = msg.substr(1);
    state.lastServerMessage = msg;
    logEvent(state, GameEventType::ServerMsg, -1, -1, -1, 0, -1, false, msg);
}

} 
