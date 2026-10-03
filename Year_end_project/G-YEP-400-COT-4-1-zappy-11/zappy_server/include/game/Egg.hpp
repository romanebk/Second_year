/*
** EPITECH PROJECT, 2026
** Egg.hpp
** File description:
** Egg class definition
*/#ifndef EGG_HPP_
#define EGG_HPP_

#include "../common/Structs.hpp"
#include "../common/Enums.hpp"
#include <string>

class Egg {
    public:
        Egg(int id, const std::string &teamName, const Position &pos);

        int getId() const { return _id; }
        const std::string &getTeamName() const { return _teamName; }
        const Position &getPosition() const { return _pos; }
        bool isHatched() const { return _hatched; }
        bool isDead() const { return _dead; }
        bool isConsumed() const { return _consumed; }

        void hatch();
        void kill();
        void consume();

    private:
        int _id;
        std::string _teamName;
        Position _pos;
        bool _hatched = false;
        bool _dead = false;
        bool _consumed = false;
};

#endif
