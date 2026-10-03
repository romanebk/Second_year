#include "../include/math_utils.hpp"
#include <cmath>
#include <string>

namespace interstonar {

Vec3 operator+(const Vec3 &a, const Vec3 &b) { return {a.x + b.x, a.y + b.y, a.z + b.z}; }
Vec3 operator-(const Vec3 &a, const Vec3 &b) { return {a.x - b.x, a.y - b.y, a.z - b.z}; }
Vec3 operator*(const Vec3 &v, double scalar) { return {v.x * scalar, v.y * scalar, v.z * scalar}; }

double magnitude(const Vec3 &v) { return std::sqrt(v.x * v.x + v.y * v.y + v.z * v.z); }

Vec3 normalize(const Vec3 &v)
{
    double mag = magnitude(v);
    if (mag == 0.0) {
        return {0.0, 0.0, 0.0};
    }
    return v * (1.0 / mag);
}

double distance_to(const Vec3 &a, const Vec3 &b) { return magnitude(a - b); }

std::string format_grouped_integer(double value)
{
    long long rounded = static_cast<long long>(std::llround(value));
    bool negative = rounded < 0;
    unsigned long long abs_value = negative ? static_cast<unsigned long long>(-rounded)
                                            : static_cast<unsigned long long>(rounded);
    std::string digits = std::to_string(abs_value);
    std::string grouped;
    for (std::size_t i = 0; i < digits.size(); ++i) {
        if (i > 0 && (digits.size() - i) % 3 == 0) {
            grouped += ',';
        }
        grouped += digits[i];
    }
    return negative ? "-" + grouped : grouped;
}

} // namespace interstonar
