/*
** EPITECH PROJECT, 2026
** main.cpp
** File description:
** Program entry point
*/

#include "StoneAnalysis.hpp"

int main(int argc, char **argv)
{
    Config config = StoneAnalysis::parseArgs(argc, argv);
    return StoneAnalysis::run(config);
}
