/*
** EPITECH PROJECT, 2026
** StoneAnalysis.cpp
** File description:
** Argument parsing and command dispatch
*/

#include "StoneAnalysis.hpp"
#include "WavFile.hpp"
#include "DFT.hpp"
#include "Analyzer.hpp"
#include "Steganography.hpp"
#include <iostream>
#include <cstring>
#include <iomanip>
#include <algorithm>
#include <fstream>

Config StoneAnalysis::parseArgs(int argc, char **argv)
{
    Config config;

    if (argc < 2) {
        std::cerr << "Error: missing arguments" << std::endl;
        return config;
    }

    if (std::strcmp(argv[1], "--help") == 0) {
        config.helpRequested = true;
        return config;
    }

    if (argc >= 4 && (std::strcmp(argv[1], "--analyze") == 0 ||
                      std::strcmp(argv[1], "-a") == 0)) {
        config.mode = Mode::Analyze;
        config.inFile = argv[2];

        char *end;
        config.n = std::strtoul(argv[3], &end, 10);
        if (*end != '\0' || config.n == 0) {
            std::cerr << "Error: invalid N value '" << argv[3]
                      << "' (must be a positive integer)" << std::endl;
            config.mode = Mode::None;
        }
        return config;
    }

    if (argc >= 5 && (std::strcmp(argv[1], "--cypher") == 0 ||
                      std::strcmp(argv[1], "-c") == 0)) {
        config.mode = Mode::Cypher;
        config.inFile = argv[2];
        config.outFile = argv[3];
        config.message = argv[4];

        if (config.message.empty() || config.message[0] == '\0') {
            config.mode = Mode::None;
        }

        return config;
    }

    if (argc >= 3 && (std::strcmp(argv[1], "--decypher") == 0 ||
                      std::strcmp(argv[1], "-d") == 0)) {
        config.mode = Mode::Decypher;
        config.inFile = argv[2];
        return config;
    }

    if (argc >= 2) {
        std::cerr << "Error: unknown option '" << argv[1] << "'" << std::endl;
    }

    return config;
}

void StoneAnalysis::printUsage()
{
    std::cout << "USAGE" << std::endl;
    std::cout << "  ./stone_analysis [--analyze | -a] IN_FILE N" << std::endl;
    std::cout << "  [--cypher | -c] IN_FILE OUT_FILE MESSAGE" << std::endl;
    std::cout << "  [--decypher | -d] IN_FILE" << std::endl;
    std::cout << "DESCRIPTION" << std::endl;
    std::cout << "  IN_FILE   An audio file to be analyzed" << std::endl;
    std::cout << "  OUT_FILE  Output audio file of the cypher mode" << std::endl;
    std::cout << "  MESSAGE   The message to hide in the audio file" << std::endl;
    std::cout << "  N         Number of top frequencies to display" << std::endl;
}

static bool fileExists(const std::string &path)
{
    std::ifstream f(path);
    return f.good();
}

int StoneAnalysis::run(const Config &config)
{
    if (config.helpRequested) {
        printUsage();
        return 0;
    }

    if (config.mode != Mode::None) {
        if (!fileExists(config.inFile)) {
            std::cerr << "Error: input file '" << config.inFile
                      << "' does not exist" << std::endl;
            return 84;
        }

        size_t dot = config.inFile.rfind('.');
        if (dot == std::string::npos ||
            config.inFile.substr(dot) != ".wav") {
            std::cerr << "Error: input file must have .wav extension"
                      << std::endl;
            return 84;
        }
    }

    switch (config.mode) {
    case Mode::Analyze: {
        WavFile wav;
        if (!wav.load(config.inFile))
            return 84;

        if (config.n > wav.samples.size() / 2) {
            std::cerr << "Error: N exceeds number of available frequencies ("
                      << wav.samples.size() / 2 << ")" << std::endl;
            return 84;
        }

        std::vector<Complex> spectrum = dft(wav.samples);

        auto top = Analyzer::getTopFrequencies(spectrum,
                                                wav.header.sampleRate,
                                                config.n);

        std::cout << "Top " << config.n << " frequencies:" << std::endl;
        for (const auto &pair : top) {
            std::cout << std::fixed << std::setprecision(1)
                      << pair.first << " Hz" << std::endl;
        }
        return 0;
    }
    case Mode::Cypher: {
        WavFile wav;
        if (!wav.load(config.inFile))
            return 84;

        if (!Steganography::cypher(wav, config.message))
            return 84;

        wav.removeDC();

        if (!wav.save(config.outFile))
            return 84;

        {
            WavFile verify;
            if (!verify.load(config.outFile)) {
                std::cerr << "Error: output file integrity check failed"
                          << std::endl;
                return 84;
            }
        }

        return 0;
    }
    case Mode::Decypher: {
        WavFile wav;
        if (!wav.load(config.inFile))
            return 84;

        std::string msg = Steganography::decypher(wav);
        if (msg.empty())
            return 84;

        std::cout << msg << std::endl;
        return 0;
    }
    default:
        std::cerr << "Error: invalid arguments" << std::endl;
        printUsage();
        return 84;
    }
}