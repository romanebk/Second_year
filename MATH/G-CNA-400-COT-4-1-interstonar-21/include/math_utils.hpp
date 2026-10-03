#pragma once

#include "types.hpp"
#include <string>

namespace interstonar {

Vec3 operator+(const Vec3 &a, const Vec3 &b);
Vec3 operator-(const Vec3 &a, const Vec3 &b);
Vec3 operator*(const Vec3 &v, double scalar);

double magnitude(const Vec3 &v);
Vec3 normalize(const Vec3 &v);
double distance_to(const Vec3 &a, const Vec3 &b);
std::string format_grouped_integer(double value);

} // namespace interstonar
