
#include "../include/Core/ACore.hpp"
#include "../include/Error.hpp"
#include <exception>
#include <iostream>

void usage(void) {

}


int main(int argc, char **argv)
{
    std::string initLib;
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <./lib/displayLibrary.so>" << std::endl << "With displayLibrary.so a display library" << std::endl;
        return 84;
    }
    try {
        Core core(initLib = argv[1]);
        core.run();
    } catch (const std::exception &e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 84;
    }
    return 0;
}