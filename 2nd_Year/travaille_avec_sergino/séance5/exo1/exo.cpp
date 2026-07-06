#include "exo.hpp"
#include <sstream>
#include <memory>

int main() {
    std::cout << "le minimum est " << minimum(5, 10) << std::endl;
    std::cout << "le minimum est " << minimum(3.14, 2.71) << std::endl;
    std::cout << "le minimum est " << minimum(std::string("ari"), std::string("boko")) << std::endl;
    return 0;
}

