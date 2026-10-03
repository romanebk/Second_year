#pragma once

#include "types.hpp"
#include <vector>

namespace interstonar {

void simulate_local(const std::vector<LocalBody> &bodies, Vec3 rock_pos, Vec3 rock_dir);

} // namespace interstonar
