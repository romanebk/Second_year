/*
** EPITECH PROJECT, 2026
** Egg.cpp
** File description:
** Egg implementation
*/#include "../../include/game/Egg.hpp"

Egg::Egg(int id, const std::string &teamName, const Position &pos)
    : _id(id), _teamName(teamName), _pos(pos) {}

void Egg::hatch() { _hatched = true; }

void Egg::kill() { _dead = true; }

void Egg::consume() { _consumed = true; }
