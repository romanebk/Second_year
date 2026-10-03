#include "../../include/protocol/AIProtocol.hpp"
#include <sstream>
#include <algorithm>

ParsedAction AIProtocol::parse(const std::string &line)
{
    ParsedAction result = {ActionType::NONE, {}};
    std::istringstream iss(line);
    std::string cmd;
    iss >> cmd;

    if (cmd == "Forward") result.type = ActionType::FORWARD;
    else if (cmd == "Right") result.type = ActionType::RIGHT;
    else if (cmd == "Left") result.type = ActionType::LEFT;
    else if (cmd == "Look") result.type = ActionType::LOOK;
    else if (cmd == "Inventory") result.type = ActionType::INVENTORY;
    else if (cmd == "Broadcast") {
        result.type = ActionType::BROADCAST;
        std::string rest;
        std::getline(iss, rest);
        if (!rest.empty() && rest[0] == ' ')
            rest = rest.substr(1);
        result.args.push_back(rest);
    } else if (cmd == "Connect_nbr") result.type = ActionType::CONNECT_NBR;
    else if (cmd == "Fork") result.type = ActionType::FORK;
    else if (cmd == "Eject") result.type = ActionType::EJECT;
    else if (cmd == "Take") {
        result.type = ActionType::TAKE;
        std::string obj;
        iss >> obj;
        result.args.push_back(obj);
    } else if (cmd == "Set") {
        result.type = ActionType::SET;
        std::string obj;
        iss >> obj;
        result.args.push_back(obj);
    } else if (cmd == "Incantation") result.type = ActionType::INCANTATION;

    return result;
}

std::string AIProtocol::formatWelcome() { return "WELCOME\n"; }

std::string AIProtocol::formatClientNum(int num)
{
    return std::to_string(num) + "\n";
}

std::string AIProtocol::formatMapSize(int x, int y)
{
    return std::to_string(x) + " " + std::to_string(y) + "\n";
}

std::string AIProtocol::formatOk() { return "ok\n"; }

std::string AIProtocol::formatKo() { return "ko\n"; }

std::string AIProtocol::formatDead() { return "dead\n"; }

std::string AIProtocol::formatElevationUnderway()
{
    return "Elevation underway\n";
}

std::string AIProtocol::formatCurrentLevel(int level)
{
    return "Current level: " + std::to_string(level) + "\n";
}

std::string AIProtocol::formatBroadcast(int direction, const std::string &msg)
{
    return "message " + std::to_string(direction) + ", " + msg + "\n";
}

std::string AIProtocol::formatEject(int direction)
{
    return "eject: " + std::to_string(direction) + "\n";
}

std::string AIProtocol::formatMessage(const std::string &msg)
{
    return msg + "\n";
}
