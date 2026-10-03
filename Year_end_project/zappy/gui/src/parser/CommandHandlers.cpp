#include "parser/CommandHandlers.hpp"
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
       >> t.resources.food
       >> t.resources.linemate
       >> t.resources.deraumere
       >> t.resources.sibur
       >> t.resources.mendiane
       >> t.resources.phiras
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
    p.id          = id;
    p.x           = x;
    p.y           = y;
    p.orientation = o;
    p.level       = l;
    p.teamName    = team;
    state.players[id] = p;
}

void handlePpo(std::istringstream &ss, GameState &state) {
    std::string idstr;
    int x, y, o;
    ss >> idstr >> x >> y >> o;
    int id = extractId(idstr);
    if (id == -1) return;
    if (state.players.count(id)) {
        state.players[id].x           = x;
        state.players[id].y           = y;
        state.players[id].orientation = o;
    }
}

void handlePlv(std::istringstream &ss, GameState &state) {
    std::string idstr;
    int l;
    ss >> idstr >> l;
    int id = extractId(idstr);
    if (id == -1) return;
    if (state.players.count(id))
        state.players[id].level = l;
}

void handlePdi(std::istringstream &ss, GameState &state) {
    std::string idstr;
    ss >> idstr;
    int id = extractId(idstr);
    if (id == -1) return;
    state.players.erase(id);
}

void handlePex(std::istringstream &ss, GameState &state) {
    std::string idstr;
    ss >> idstr;
    int id = extractId(idstr);
    if (id == -1) return;
    state.lastExpulsion = id;
}

void handlePbc(std::istringstream &ss, GameState &state) {
    std::string idstr, msg;
    ss >> idstr;
    std::getline(ss, msg);
    if (!msg.empty() && msg[0] == ' ')
        msg = msg.substr(1);
    int id = extractId(idstr);
    if (id == -1) return;
    state.lastBroadcast = {id, msg};
}

void handlePfk(std::istringstream &ss, GameState &state) {
    std::string idstr;
    ss >> idstr;
    int id = extractId(idstr);
    if (id == -1) return;
    state.lastFork = id;
}

void handlePin(std::istringstream &ss, GameState &state) {
    std::string idstr;
    int x, y;
    ss >> idstr >> x >> y;
    int id = extractId(idstr);
    if (id == -1) return;
    if (state.players.count(id)) {
        PlayerInventory &inv = state.players[id].inventory;
        ss >> inv.food
           >> inv.linemate
           >> inv.deraumere
           >> inv.sibur
           >> inv.mendiane
           >> inv.phiras
           >> inv.thystame;
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
}

void handlePgt(std::istringstream &ss, GameState &state) {
    std::string idstr;
    int resource;
    ss >> idstr >> resource;
    int id = extractId(idstr);
    if (id == -1) return;
    state.lastResourcePickup = {id, resource};
}



void handlePic(std::istringstream &ss, GameState &state) {
    int x, y, l;
    ss >> x >> y >> l;
    Incantation inc;
    inc.x      = x;
    inc.y      = y;
    inc.level  = l;
    inc.active = true;
    state.incantations[{x, y}] = inc;
}

void handlePie(std::istringstream &ss, GameState &state) {
    int x, y, r;
    ss >> x >> y >> r;
    state.incantations.erase({x, y});
}



void handleEnw(std::istringstream &ss, GameState &state) {
    std::string eidstr, nidstr;
    int x, y;
    ss >> eidstr >> nidstr >> x >> y;
    int eid = extractId(eidstr);
    if (eid == -1) return;
    Egg e;
    e.id = eid;
    e.x  = x;
    e.y  = y;
    state.eggs[eid] = e;
}

void handleEbo(std::istringstream &ss, GameState &state) {
    std::string eidstr;
    ss >> eidstr;
    int eid = extractId(eidstr);
    if (eid == -1) return;
    state.eggs.erase(eid);
}

void handleEdi(std::istringstream &ss, GameState &state) {
    std::string eidstr;
    ss >> eidstr;
    int eid = extractId(eidstr);
    if (eid == -1) return;
    state.eggs.erase(eid);
}



void handleSeg(std::istringstream &ss, GameState &state) {
    ss >> state.winner;
    state.gameOver = true;
}

void handleSmg(std::istringstream &ss, GameState &state) {
    std::string msg;
    std::getline(ss, msg);
    if (!msg.empty() && msg[0] == ' ')
        msg = msg.substr(1);
    state.lastServerMessage = msg;
}

}