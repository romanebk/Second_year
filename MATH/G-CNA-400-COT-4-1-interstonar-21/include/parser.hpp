#pragma once

#include "types.hpp"
#include <string>
#include <vector>

namespace interstonar {

double parse_number(const std::string &token);
std::vector<CelestialBody> parse_global_config(const std::string &path);
std::vector<LocalBody> parse_local_config(const std::string &path);

} // namespace interstonar
