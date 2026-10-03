#include "../include/ServerApp.hpp"
#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <unistd.h>

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

    int opt;
    while ((opt = getopt(argc, argv, "p:x:y:n:c:f:h")) != -1) {
        switch (opt) {
            case 'p': port = std::atoi(optarg); break;
            case 'x': width = std::atoi(optarg); break;
            case 'y': height = std::atoi(optarg); break;
            case 'n': teams.push_back(optarg); break;
            case 'c': clientsPerTeam = std::atoi(optarg); break;
            case 'f': freq = std::atoi(optarg); break;
            case 'h': printUsage(); return 0;
            default: printUsage(); return 84;
        }
    }

    while (optind < argc)
        teams.push_back(argv[optind++]);

    if (port <= 0 || width <= 0 || height <= 0 || teams.empty() || clientsPerTeam <= 0) {
        printUsage();
        return 84;
    }

    ServerApp app;
    app.init(width, height, teams, clientsPerTeam, freq);

    if (!app.initNetwork(port)) {
        std::cerr << "Failed to start server on port " << port << std::endl;
        return 84;
    }

    std::cout << "Zappy server started on port " << port
              << " (" << width << "x" << height << ", "
              << teams.size() << " teams, "
              << clientsPerTeam << " slots/team, freq=" << freq << ")"
              << std::endl;

    app.run();
    return 0;
}
