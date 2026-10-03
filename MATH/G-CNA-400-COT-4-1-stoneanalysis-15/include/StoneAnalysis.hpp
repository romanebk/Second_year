/*
** EPITECH PROJECT, 2026
** StoneAnalysis.hpp
** File description:
** Program entry point and CLI
*/

#ifndef STONEANALYSIS_HPP
#define STONEANALYSIS_HPP

#include <cstddef>
#include <string>
#include <vector>

enum class Mode {
    None,
    Analyze,
    Cypher,
    Decypher
};

struct Config {
    Mode mode = Mode::None;
    bool helpRequested = false;
    std::string inFile;
    std::string outFile;
    std::string message;
    size_t n = 0;
};

class StoneAnalysis {
public:
    static Config parseArgs(int argc, char **argv);
    static int run(const Config &config);
    static void printUsage();
};

#endif
