/*
** EPITECH PROJECT, 2026
** AIProtocol.hpp
** File description:
** AI protocol header
*/#ifndef AIPROTOCOL_HPP_
#define AIPROTOCOL_HPP_

#include "../common/Enums.hpp"
#include <string>
#include <vector>

struct ParsedAction {
    ActionType type;
    std::vector<std::string> args;
};

class AIProtocol {
    public:
        static ParsedAction parse(const std::string &line);

        static std::string formatWelcome();
        static std::string formatClientNum(int num);
        static std::string formatMapSize(int x, int y);
        static std::string formatOk();
        static std::string formatKo();
        static std::string formatDead();
        static std::string formatElevationUnderway();
        static std::string formatCurrentLevel(int level);
        static std::string formatBroadcast(int direction, const std::string &msg);
        static std::string formatEject(int direction);
        static std::string formatMessage(const std::string &msg);
};

#endif
