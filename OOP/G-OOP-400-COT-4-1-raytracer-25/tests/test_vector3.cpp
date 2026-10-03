#include "doctest.h"
#include "../include/Math/Vector3.hpp"
#include <cmath>

TEST_CASE("Vector3 - Construction") {
    Vector3 v;
    CHECK(v.x == 0.0);
    CHECK(v.y == 0.0);
    CHECK(v.z == 0.0);

    Vector3 v2(1.0, 2.0, 3.0);
    CHECK(v2.x == 1.0);
    CHECK(v2.y == 2.0);
    CHECK(v2.z == 3.0);
}

TEST_CASE("Vector3 - Addition") {
    Vector3 a(1, 2, 3);
    Vector3 b(4, 5, 6);
    Vector3 c = a + b;
    CHECK(c.x == 5.0);
    CHECK(c.y == 7.0);
    CHECK(c.z == 9.0);
}

TEST_CASE("Vector3 - Subtraction") {
    Vector3 a(5, 7, 9);
    Vector3 b(1, 2, 3);
    Vector3 c = a - b;
    CHECK(c.x == 4.0);
    CHECK(c.y == 5.0);
    CHECK(c.z == 6.0);
}

TEST_CASE("Vector3 - Negation") {
    Vector3 a(1, -2, 3);
    Vector3 b = -a;
    CHECK(b.x == -1.0);
    CHECK(b.y == 2.0);
    CHECK(b.z == -3.0);
}

TEST_CASE("Vector3 - Scalar multiplication") {
    Vector3 a(1, 2, 3);
    Vector3 b = a * 2.0;
    CHECK(b.x == 2.0);
    CHECK(b.y == 4.0);
    CHECK(b.z == 6.0);
}

TEST_CASE("Vector3 - Scalar division") {
    Vector3 a(2, 4, 6);
    Vector3 b = a / 2.0;
    CHECK(b.x == 1.0);
    CHECK(b.y == 2.0);
    CHECK(b.z == 3.0);
}

TEST_CASE("Vector3 - Dot product") {
    Vector3 a(1, 0, 0);
    Vector3 b(0, 1, 0);
    CHECK(a.dot(b) == 0.0);

    Vector3 c(1, 2, 3);
    Vector3 d(4, 5, 6);
    CHECK(c.dot(d) == 32.0);
}

TEST_CASE("Vector3 - Cross product") {
    Vector3 a(1, 0, 0);
    Vector3 b(0, 1, 0);
    Vector3 c = a.cross(b);
    CHECK(c.x == 0.0);
    CHECK(c.y == 0.0);
    CHECK(c.z == 1.0);

    Vector3 d = b.cross(a);
    CHECK(d.x == 0.0);
    CHECK(d.y == 0.0);
    CHECK(d.z == -1.0);
}

TEST_CASE("Vector3 - Length") {
    Vector3 a(1, 0, 0);
    CHECK(a.length() == 1.0);

    Vector3 b(3, 4, 0);
    CHECK(b.length() == 5.0);

    CHECK(b.lengthSquared() == 25.0);
}

TEST_CASE("Vector3 - Normalize") {
    Vector3 a(3, 4, 0);
    a.normalize();
    CHECK(std::abs(a.x - 0.6) < 1e-10);
    CHECK(std::abs(a.y - 0.8) < 1e-10);
    CHECK(std::abs(a.z) < 1e-10);
    CHECK(std::abs(a.length() - 1.0) < 1e-10);
}

TEST_CASE("Vector3 - Normalized") {
    Vector3 a(3, 4, 0);
    Vector3 b = a.normalized();
    CHECK(std::abs(b.x - 0.6) < 1e-10);
    CHECK(std::abs(b.y - 0.8) < 1e-10);
    CHECK(a.x == 3.0);
}

TEST_CASE("Vector3 - Compound assignment") {
    Vector3 a(1, 2, 3);
    a += Vector3(4, 5, 6);
    CHECK(a.x == 5.0);

    a -= Vector3(1, 1, 1);
    CHECK(a.x == 4.0);

    a *= 2.0;
    CHECK(a.x == 8.0);

    a /= 4.0;
    CHECK(a.x == 2.0);
}
