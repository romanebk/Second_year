#include "../include/local_sim.hpp"
#include "../include/math_utils.hpp"
#include <cmath>
#include <iomanip>
#include <iostream>
#include <limits>
#include <map>

namespace interstonar {

static double sdf_sphere(const Vec3 &p, const Vec3 &center, double r) { return distance_to(p, center) - r; }

static double sdf_cylinder(const Vec3 &p, const Vec3 &c, double r, bool has_height, double h)
{
    double qx = std::hypot(p.x - c.x, p.y - c.y) - r;
    if (!has_height) {
        return qx;
    }
    double qy = std::abs(p.z - c.z) - h / 2.0;
    double outside = magnitude({std::max(qx, 0.0), std::max(qy, 0.0), 0.0});
    double inside = std::min(std::max(qx, qy), 0.0);
    return outside + inside;
}

static double sdf_box(const Vec3 &p, const Vec3 &c, const Vec3 &s)
{
    double dx = std::abs(p.x - c.x) - s.x / 2.0;
    double dy = std::abs(p.y - c.y) - s.y / 2.0;
    double dz = std::abs(p.z - c.z) - s.z / 2.0;
    double outside = magnitude({std::max(dx, 0.0), std::max(dy, 0.0), std::max(dz, 0.0)});
    double inside = std::min(std::max(dx, std::max(dy, dz)), 0.0);
    return outside + inside;
}

static double sdf_torus(const Vec3 &p, const Vec3 &c, double inner, double outer)
{
    Vec3 q{std::hypot(p.x - c.x, p.y - c.y) - inner, p.z - c.z, 0.0};
    return magnitude(q) - outer;
}

void simulate_local(const std::vector<LocalBody> &bodies, Vec3 rock_pos, Vec3 rock_dir)
{
    Vec3 direction = normalize(rock_dir);
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Rock thrown at the point (" << rock_pos.x << ", " << rock_pos.y << ", " << rock_pos.z
              << ") and parallel to the vector (" << rock_dir.x << ", " << rock_dir.y << ", " << rock_dir.z
              << ")" << std::endl;

    std::map<std::string, int> counters;
    std::vector<std::pair<std::string, LocalBody>> named;
    for (const auto &b : bodies) {
        counters[b.body_type]++;
        std::string auto_name;
        if (b.body_type == "sphere") auto_name = "SPHERE_" + std::to_string(counters[b.body_type]);
        if (b.body_type == "cylinder") auto_name = "CYLINDER_" + std::to_string(counters[b.body_type]);
        if (b.body_type == "box") auto_name = "BOX_" + std::to_string(counters[b.body_type]);
        if (b.body_type == "torus") auto_name = "TORUS_" + std::to_string(counters[b.body_type]);
        named.push_back({b.has_name ? b.name : auto_name, b});
    }

    for (const auto &entry : named) {
        const LocalBody &b = entry.second;
        if (b.body_type == "sphere") {
            std::cout << "Sphere of radius " << b.radius << " at position (" << b.position.x << ", " << b.position.y
                      << ", " << b.position.z << ")" << std::endl;
        } else if (b.body_type == "cylinder") {
            std::cout << "Cylinder of radius " << b.radius;
            if (b.has_height) {
                std::cout << " and height " << b.height;
            } else {
                std::cout << " and infinite height";
            }
            std::cout << " at position (" << b.position.x << ", " << b.position.y << ", " << b.position.z << ")"
                      << std::endl;
        } else if (b.body_type == "box") {
            std::cout << "Box of dimensions (" << b.sides.x << ", " << b.sides.y << ", " << b.sides.z
                      << ") at position (" << b.position.x << ", " << b.position.y << ", " << b.position.z << ")"
                      << std::endl;
        } else if (b.body_type == "torus") {
            std::cout << "Torus of inner radius " << b.inner_radius << " and outer radius " << b.outer_radius
                      << " at position (" << b.position.x << ", " << b.position.y << ", " << b.position.z << ")\n"
                      << std::endl;
        }
    }
    if (named.size() == 1) {
        std::cout << std::endl;
    }

    Vec3 current = rock_pos;
    double previous_min_dist = std::numeric_limits<double>::infinity();
    for (int step = 1; step <= MAX_STEPS; ++step) {
        double min_dist = std::numeric_limits<double>::infinity();
        std::string closest_name;
        for (const auto &entry : named) {
            const std::string &name = entry.first;
            const LocalBody &b = entry.second;
            double dist = std::numeric_limits<double>::infinity();
            if (b.body_type == "sphere") {
                dist = sdf_sphere(current, b.position, b.radius);
            } else if (b.body_type == "cylinder") {
                dist = sdf_cylinder(current, b.position, b.radius, b.has_height, b.height);
            } else if (b.body_type == "box") {
                dist = sdf_box(current, b.position, b.sides);
            } else if (b.body_type == "torus") {
                dist = sdf_torus(current, b.position, b.inner_radius, b.outer_radius);
            }
            if (dist < min_dist) {
                min_dist = dist;
                closest_name = name;
            }
        }
        bool out_of_scene = (min_dist > 1000.0 && min_dist > previous_min_dist);
        current = current + direction * min_dist;
        if (step == MAX_STEPS) {
            std::cout << std::endl;
        }
        std::cout << "Step " << step << ": (" << current.x << ", " << current.y << ", " << current.z << ")" << std::endl;
        if (out_of_scene) {
            std::cout << std::endl;
            std::cout << "Result: Out of scene" << std::endl;
            return;
        }
        previous_min_dist = min_dist;

        if (min_dist <= SDF_THRESHOLD) {
            std::cout << std::endl;
            std::cout << "Result: Intersection with " << closest_name << std::endl;
            return;
        }
    }
    std::cout << "\nResult: Steps limit reached" << std::endl;
}

} // namespace interstonar
