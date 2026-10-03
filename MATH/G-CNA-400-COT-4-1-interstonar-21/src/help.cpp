#include "../include/help.hpp"
#include <cstdlib>
#include <iostream>

namespace interstonar {

void print_help_and_exit()
{
    std::cout << "USAGE" << std::endl;
    std::cout << "\t./interstonar [--global | --local] CONFIG_FILE [-d TIME | --delta=TIME] Px Py Pz Vx Vy Vz" << std::endl;
    std::cout << "\nDESCRIPTION" << std::endl;
    std::cout << "\t--global" << std::endl;
    std::cout << "\t    Launch program in global scene mode. The CONFIG_FILE will describe a scene containing" << std::endl;
    std::cout << "\t    massive spherical moving bodies." << std::endl;
    std::cout << "\n\t--local" << std::endl;
    std::cout << "\t    Launch program in local scene mode. The CONFIG_FILE will describe a scene containing" << std::endl;
    std::cout << "\t    massless motionless shapes." << std::endl;
    std::cout << "\n\t-d TIME, --delta=TIME" << std::endl;
    std::cout << "\t    GLOBAL mode only. Sets the delta time (in SI base unit) for which every position is updated." << std::endl;
    std::cout << "\n\tCONFIG_FILE" << std::endl;
    std::cout << "\t    TOML configuration file describing a scene." << std::endl;
    std::cout << "\n\tPi" << std::endl;
    std::cout << "\t    Initial position coordinates of the rock" << std::endl;
    std::cout << "\n\tVi" << std::endl;
    std::cout << "\t    Initial velocity vector of the rock" << std::endl;
    std::exit(0);
}

}