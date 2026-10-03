#pragma once

#include <string>
#include <vector>

namespace interstonar {

constexpr double G = 6.674e-11;
constexpr int MAX_STEPS = 1000;
constexpr double SDF_THRESHOLD = 0.1;

struct Vec3 {
    double x = 0.0;
    double y = 0.0;
    double z = 0.0;
};

struct CelestialBody {
    std::string name;
    Vec3 position;
    Vec3 direction;
    double mass = 0.0;
    double radius = 0.0;
};

struct LocalBody {
    std::string name;
    bool has_name = false;
    Vec3 position;
    std::string body_type;
    bool has_radius = false;
    double radius = 0.0;
    bool has_height = false;
    double height = 0.0;
    bool has_sides = false;
    Vec3 sides;
    bool has_inner_radius = false;
    double inner_radius = 0.0;
    bool has_outer_radius = false;
    double outer_radius = 0.0;
};

} // namespace interstonar
