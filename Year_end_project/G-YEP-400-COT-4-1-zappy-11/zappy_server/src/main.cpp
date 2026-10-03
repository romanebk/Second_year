/*
** EPITECH PROJECT, 2026
** main.cpp
** File description:
** Program entry point
*/#include "../include/ServerApp.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <unistd.h>
#include <csignal>
#include <cerrno>

static void printUsage()
{
    std::cout << "USAGE: ./zappy_server -p port -x width -y height -n name1 name2 ... -c clientsNb -f freq\n";
    std::cout << "\t-p port\t\tport number\n";
    std::cout << "\t-x width\twidth of the world\n";
    std::cout << "\t-y height\theight of the world\n";
    std::cout << "\t-n name1 name2 ...\tname of the team\n";
    std::cout << "\t-c clientsNb\tnumber of initial clients per team\n";
    std::cout << "\t-f freq\t\treciprocal of time unit for execution of actions\n";
}

int main(int argc, char **argv)
{
    int port = 0;
    int width = 0;
    int height = 0;
    std::vector<std::string> teams;
    int clientsPerTeam = 0;
    int freq = 100;

    auto safeStoi = [](const char *s, int &out) -> bool {
        char *end = nullptr;
        long val = std::strtol(s, &end, 10);
        if (end == s || *end != '\0' || errno == ERANGE)
            return false;
        out = static_cast<int>(val);
        return true;
    };

    bool seenPort = false;
    bool seenWidth = false;
    bool seenHeight = false;
    bool seenClients = false;
    bool seenFreq = false;

    int opt;
    while ((opt = getopt(argc, argv, "p:x:y:n:c:f:h")) != -1) {
        switch (opt) {
            case 'p':
                if (seenPort) { printUsage(); return 84; }
                seenPort = true;
                if (!safeStoi(optarg, port)) { printUsage(); return 84; }
                break;
            case 'x':
                if (seenWidth) { printUsage(); return 84; }
                seenWidth = true;
                if (!safeStoi(optarg, width)) { printUsage(); return 84; }
                break;
            case 'y':
                if (seenHeight) { printUsage(); return 84; }
                seenHeight = true;
                if (!safeStoi(optarg, height)) { printUsage(); return 84; }
                break;
            case 'n': teams.push_back(optarg); break;
            case 'c':
                if (seenClients) { printUsage(); return 84; }
                seenClients = true;
                if (!safeStoi(optarg, clientsPerTeam)) { printUsage(); return 84; }
                break;
            case 'f':
                if (seenFreq) { printUsage(); return 84; }
                seenFreq = true;
                if (!safeStoi(optarg, freq)) { printUsage(); return 84; }
                break;
            case 'h': printUsage(); return 0;
            default: printUsage(); return 84;
        }
    }

    while (optind < argc)
        teams.push_back(argv[optind++]);

    if (port <= 0 || port > 65535 || width <= 0 || height <= 0 || teams.empty() || clientsPerTeam <= 0 || freq <= 0 || clientsPerTeam < 6) {
        printUsage();
        return 84;
    }

    ServerApp app;
    app.init(width, height, teams, clientsPerTeam, freq);

    if (!app.initNetwork(port)) {
        std::cerr << "Failed to start server on port " << port << std::endl;
        return 84;
    }

    std::signal(SIGPIPE, SIG_IGN);

    std::cout << "Zappy server started on port " << port
              << " (" << width << "x" << height << ", "
              << teams.size() << " teams, "
              << clientsPerTeam << " slots/team, freq=" << freq << ")"
              << std::endl;

    app.run();
    return 0;
}
