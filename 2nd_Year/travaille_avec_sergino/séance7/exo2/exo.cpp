#include "exo.hpp"

void addToVector(std::vector<std::string>& vec, std::string s) {
    vec.push_back(std::move(s));
}
