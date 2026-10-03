#include "doctest.h"
#include "../include/Math/Matrix4.hpp"
#include "../include/Math/Vector3.hpp"
#include <cmath>

TEST_CASE("Matrix4 - Identity") {
    Matrix4 I = Matrix4::identity();
    Vector3 v(1, 2, 3);
    Vector3 r = I * v;
    CHECK(r.x == 1.0);
    CHECK(r.y == 2.0);
    CHECK(r.z == 3.0);
}

TEST_CASE("Matrix4 - Multiplication") {
    Matrix4 I = Matrix4::identity();
    Matrix4 R = Matrix4::rotationZ(90);
    Matrix4 result = I * R;
    Vector3 v(1, 0, 0);
    Vector3 r = result * v;
    CHECK(std::abs(r.x) < 1e-10);
    CHECK(std::abs(r.y - 1.0) < 1e-10);
}

TEST_CASE("Matrix4 - RotationZ 90") {
    Matrix4 R = Matrix4::rotationZ(90);
    Vector3 v(1, 0, 0);
    Vector3 r = R * v;
    CHECK(std::abs(r.x) < 1e-10);
    CHECK(std::abs(r.y - 1.0) < 1e-10);
    CHECK(std::abs(r.z) < 1e-10);
}

TEST_CASE("Matrix4 - RotationX 90") {
    Matrix4 R = Matrix4::rotationX(90);
    Vector3 v(0, 1, 0);
    Vector3 r = R * v;
    CHECK(std::abs(r.x) < 1e-10);
    CHECK(std::abs(r.y) < 1e-10);
    CHECK(std::abs(r.z - 1.0) < 1e-10);
}

TEST_CASE("Matrix4 - RotationY 90") {
    Matrix4 R = Matrix4::rotationY(90);
    Vector3 v(1, 0, 0);
    Vector3 r = R * v;
    CHECK(std::abs(r.x) < 1e-10);
    CHECK(std::abs(r.z + 1.0) < 1e-10);
}

TEST_CASE("Matrix4 - Translation") {
    Matrix4 T = Matrix4::translation(10, 20, 30);
    Vector3 v(1, 2, 3);
    Vector3 r = T * v;
    CHECK(r.x == 11.0);
    CHECK(r.y == 22.0);
    CHECK(r.z == 33.0);
}

TEST_CASE("Matrix4 - Inverse of translation") {
    Matrix4 T = Matrix4::translation(10, 20, 30);
    Matrix4 inv = T.inverse();
    Vector3 v(11, 22, 33);
    Vector3 r = inv * v;
    CHECK(r.x == 1.0);
    CHECK(r.y == 2.0);
    CHECK(r.z == 3.0);
}

TEST_CASE("Matrix4 - Inverse of rotation") {
    Matrix4 R = Matrix4::rotationZ(45);
    Matrix4 inv = R.inverse();
    Vector3 v(1, 0, 0);
    Vector3 r = R * v;
    Vector3 back = inv * r;
    CHECK(std::abs(back.x - 1.0) < 1e-10);
    CHECK(std::abs(back.y) < 1e-10);
}

TEST_CASE("Matrix4 - Transpose") {
    Matrix4 M = Matrix4::translation(1, 2, 3);
    Matrix4 T = M.transpose();
    CHECK(T.get(0, 3) == 0.0);
    CHECK(T.get(3, 0) == 1.0);
}

TEST_CASE("Matrix4 - fromEuler") {
    Matrix4 R = Matrix4::fromEuler(0, 0, 90);
    Vector3 v(1, 0, 0);
    Vector3 r = R * v;
    CHECK(std::abs(r.x) < 1e-10);
    CHECK(std::abs(r.y - 1.0) < 1e-10);

    R = Matrix4::fromEuler(0, 0, 0);
    v = Vector3(1, 1, 1);
    r = R * v;
    CHECK(r.x == 1.0);
    CHECK(r.y == 1.0);
    CHECK(r.z == 1.0);
}

TEST_CASE("Matrix4 - Get/Set") {
    Matrix4 M;
    M.set(1, 2, 42.0);
    CHECK(M.get(1, 2) == 42.0);
    M.set(1, 2, 0.0);
    CHECK(M.get(1, 2) == 0.0);
}
