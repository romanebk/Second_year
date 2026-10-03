#include "../include/global_sim.hpp"
#include "../include/math_utils.hpp"
#include <algorithm>
#include <cmath>
#include <iostream>
#include <map>
#include <sstream>

namespace interstonar {

static Vec3 calculate_acceleration(const Vec3 &pos, const std::vector<CelestialBody> &bodies, int ignore_idx)
{
    Vec3 total{0.0, 0.0, 0.0};
    for (std::size_t i = 0; i < bodies.size(); ++i) {
        if (static_cast<int>(i) == ignore_idx) {
            continue;
        }
        Vec3 r_vec = bodies[i].position - pos;
        double r_mag = magnitude(r_vec);
        if (r_mag > 0.0) {
            double accel_mag = G * bodies[i].mass / (r_mag * r_mag);
            total = total + normalize(r_vec) * accel_mag;
        }
    }
    return total;
}

static void handle_body_merges(std::vector<CelestialBody> &bodies)
{
    if (bodies.size() < 2) {
        return;
    }
    std::vector<int> parent(static_cast<int>(bodies.size()));
    for (int i = 0; i < static_cast<int>(bodies.size()); ++i) {
        parent[i] = i;
    }

    auto find = [&](auto &&self, int x) -> int {
        if (parent[x] != x) {
            parent[x] = self(self, parent[x]);
        }
        return parent[x];
    };
    auto unite = [&](int a, int b) {
        int ra = find(find, a);
        int rb = find(find, b);
        if (ra != rb) {
            parent[rb] = ra;
        }
    };

    for (int i = 0; i < static_cast<int>(bodies.size()); ++i) {
        for (int j = i + 1; j < static_cast<int>(bodies.size()); ++j) {
            if (distance_to(bodies[i].position, bodies[j].position) <= bodies[i].radius + bodies[j].radius) {
                unite(i, j);
            }
        }
    }

    std::map<int, std::vector<int>> groups;
    for (int i = 0; i < static_cast<int>(bodies.size()); ++i) {
        groups[find(find, i)].push_back(i);
    }

    std::vector<CelestialBody> merged;
    merged.reserve(groups.size());
    for (const auto &entry : groups) {
        const std::vector<int> &indices = entry.second;
        if (indices.size() == 1) {
            merged.push_back(bodies[indices.front()]);
            continue;
        }
        double new_mass = 0.0;
        double total_volume = 0.0;
        double speed_weight_sum = 0.0;
        std::vector<std::string> names;
        for (int idx : indices) {
            new_mass += bodies[idx].mass;
            total_volume += (4.0 / 3.0) * M_PI * std::pow(bodies[idx].radius, 3);
            speed_weight_sum += magnitude(bodies[idx].direction);
            names.push_back(bodies[idx].name);
        }
        Vec3 position{0.0, 0.0, 0.0};
        if (speed_weight_sum > 0.0) {
            for (int idx : indices) {
                double w = magnitude(bodies[idx].direction) / speed_weight_sum;
                position = position + bodies[idx].position * w;
            }
        } else {
            for (int idx : indices) {
                position = position + bodies[idx].position * (1.0 / static_cast<double>(indices.size()));
            }
        }
        Vec3 velocity{0.0, 0.0, 0.0};
        for (int idx : indices) {
            velocity = velocity + bodies[idx].direction * (bodies[idx].mass / new_mass);
        }
        std::sort(names.begin(), names.end());
        std::ostringstream joined;
        for (std::size_t i = 0; i < names.size(); ++i) {
            if (i > 0) {
                joined << "-";
            }
            joined << names[i];
        }
        CelestialBody out;
        out.name = joined.str();
        out.position = position;
        out.direction = velocity;
        out.mass = new_mass;
        out.radius = std::pow((3.0 * total_volume) / (4.0 * M_PI), 1.0 / 3.0);
        merged.push_back(out);
    }
    bodies = merged;
}

void simulate_global(std::vector<CelestialBody> bodies, Vec3 rock_pos, Vec3 rock_vel, double delta_time)
{
    std::cout << "Rock coordinates (x y z) are:" << std::endl;
    for (int t = 0; t <= MAX_STEPS; ++t) {
        std::cout << "t = " << t << ": (" << format_grouped_integer(rock_pos.x) << " "
                  << format_grouped_integer(rock_pos.y) << " " << format_grouped_integer(rock_pos.z) << ")"
                  << std::endl;

        for (const auto &body : bodies) {
            if (distance_to(rock_pos, body.position) <= body.radius) {
                std::cout << "Collision between rock and " << body.name << std::endl;
                std::cout << std::endl;
                std::cout << "Mission success" << std::endl;
                return;
            }
        }
        if (t == MAX_STEPS) {
            break;
        }

        Vec3 rock_accel = calculate_acceleration(rock_pos, bodies, -1);
        rock_pos = rock_pos + rock_vel * delta_time;
        rock_vel = rock_vel + rock_accel * delta_time;

        std::vector<CelestialBody> updated = bodies;
        for (std::size_t i = 0; i < bodies.size(); ++i) {
            Vec3 body_accel = calculate_acceleration(bodies[i].position, bodies, static_cast<int>(i));
            updated[i].position = bodies[i].position + bodies[i].direction * delta_time;
            updated[i].direction = bodies[i].direction + body_accel * delta_time;
        }
        bodies = updated;
        handle_body_merges(bodies);
    }
    std::cout << std::endl;
    std::cout << "Mission failure" << std::endl;
}

} // namespace interstonar
