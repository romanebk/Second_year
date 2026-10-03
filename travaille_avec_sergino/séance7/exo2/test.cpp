#include "exo.hpp"
#include <iostream>

int main() {
    std::vector<std::string> v;
    std::string a = "hello";
    std::string b = "world";

    addToVector(v, a);            // lvalue → copie
    addToVector(v, std::move(b)); // rvalue → move
    addToVector(v, "temp");       // temporary → move

    for (const auto& s : v)
        std::cout << s << " ";
    std::cout << std::endl;

    std::cout << "a = \"" << a << "\" (still valid)\n";
    std::cout << "b = \"" << b << "\" (moved-from, empty)\n";
    return 0;
}
