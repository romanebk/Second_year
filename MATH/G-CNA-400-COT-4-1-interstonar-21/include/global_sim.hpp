#pragma once

#include "types.hpp"
#include <vector>

namespace interstonar {

void simulate_global(std::vector<CelestialBody> bodies, Vec3 rock_pos, Vec3 rock_vel, double delta_time);

}
