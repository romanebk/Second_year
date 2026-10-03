#ifndef IGAMEENGINE_HPP_
#define IGAMEENGINE_HPP_

#include "../common/Structs.hpp"
#include "../common/Constants.hpp"
#include <string>
#include <vector>
#include <functional>

class IGameEngine {
    public:
        virtual ~IGameEngine() = default;

        virtual void init(int width, int height, const std::vector<std::string> &teams, int clientsPerTeam, int freq) = 0;
        virtual int getWidth() const = 0;
        virtual int getHeight() const = 0;
        virtual int getFreq() const = 0;

        virtual void update(double deltaTime) = 0;
        virtual double getTimeUntilNextEvent() const = 0;
        virtual bool isGameOver() const = 0;
        virtual const std::string &getWinner() const = 0;
};

#endif
