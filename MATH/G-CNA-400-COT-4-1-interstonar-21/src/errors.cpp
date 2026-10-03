#include "../include/errors.hpp"
#include <cstdlib>
#include <iostream>

namespace interstonar {

void exit_with_error(const std::string &msg)
{
    std::cerr << msg << std::endl;
    std::exit(84);
}

} // namespace interstonar
