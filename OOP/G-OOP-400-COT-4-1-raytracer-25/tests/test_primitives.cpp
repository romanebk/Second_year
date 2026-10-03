#include "doctest.h"
#include "../include/Primitives/Sphere.hpp"
#include "../include/Primitives/Plane.hpp"
#include "../include/Primitives/Cylinder.hpp"
#include "../include/Primitives/Cone.hpp"
#include "../include/Core/Ray.hpp"
#include "../include/Core/HitRecord.hpp"
#include "../include/Math/Matrix4.hpp"
#include <cmath>
#include <memory>

TEST_CASE("Sphere - basic hit") {
    Sphere s(Vector3(0, 0, 0), 5.0, Vector3(255, 0, 0));
    Ray r(Vector3(0, 0, -20), Vector3(0, 0, 1));
    HitRecord rec;

    bool hit = s.hit(r, 0.001, 1e9, rec);
    CHECK(hit);
    CHECK(std::abs(rec.t - 15.0) < 1e-6);
    CHECK(rec.couleur.x == 255);
}

TEST_CASE("Sphere - miss") {
    Sphere s(Vector3(0, 0, 0), 5.0, Vector3(255, 0, 0));
    Ray r(Vector3(0, 100, -20), Vector3(0, 0, 1));
    HitRecord rec;

    bool hit = s.hit(r, 0.001, 1e9, rec);
    CHECK_FALSE(hit);
}

TEST_CASE("Sphere - tangent ray") {
    Sphere s(Vector3(0, 0, 0), 5.0, Vector3(255, 0, 0));
    Ray r(Vector3(5, 0, -20), Vector3(0, 0, 1));
    HitRecord rec;

    bool hit = s.hit(r, 0.001, 1e9, rec);
    CHECK(hit);
    CHECK(std::abs(rec.t - 20.0) < 1e-6);
}

TEST_CASE("Sphere - normal") {
    Sphere s(Vector3(0, 0, 0), 5.0, Vector3(255, 0, 0));
    Ray r(Vector3(0, 0, -20), Vector3(0, 0, 1));
    HitRecord rec;

    bool hit = s.hit(r, 0.001, 1e9, rec);
    CHECK(hit);

    Vector3 expectedNormal(0, 0, -1);
    CHECK(std::abs(rec.normal.x - expectedNormal.x) < 1e-6);
    CHECK(std::abs(rec.normal.y - expectedNormal.y) < 1e-6);
    CHECK(std::abs(rec.normal.z - expectedNormal.z) < 1e-6);
}

TEST_CASE("Sphere - translation") {
    Sphere s(Vector3(0, 0, 0), 5.0, Vector3(255, 0, 0), Vector3(0, 0, 10));
    Ray r(Vector3(0, 0, -20), Vector3(0, 0, 1));
    HitRecord rec;

    bool hit = s.hit(r, 0.001, 1e9, rec);
    CHECK(hit);
    CHECK(std::abs(rec.t - 25.0) < 1e-6);
}

TEST_CASE("Sphere - with rotation (sphere is symmetric)") {
    Matrix4 rot = Matrix4::fromEuler(45, 30, 60);
    Sphere s(Vector3(0, 0, 0), 5.0, Vector3(255, 0, 0), Vector3(0, 0, 0), rot);
    Ray r(Vector3(0, 0, -20), Vector3(0, 0, 1));
    HitRecord rec;

    bool hit = s.hit(r, 0.001, 1e9, rec);
    CHECK(hit);
    CHECK(std::abs(rec.t - 15.0) < 1e-6);
}

TEST_CASE("Plane - basic hit") {
    Plane p("Z", 0.0, Vector3(128, 128, 128));
    Ray r(Vector3(0, 0, -10), Vector3(0, 0, 1));
    HitRecord rec;

    bool hit = p.hit(r, 0.001, 1e9, rec);
    CHECK(hit);
    CHECK(rec.normal.z == 1.0);
}

TEST_CASE("Plane - parallel miss") {
    Plane p("Z", 0.0, Vector3(128, 128, 128));
    Ray r(Vector3(0, 0, -10), Vector3(1, 0, 0));
    HitRecord rec;

    bool hit = p.hit(r, 0.001, 1e9, rec);
    CHECK_FALSE(hit);
}

TEST_CASE("Plane - rotated plane") {
    Matrix4 rot = Matrix4::fromEuler(0, 0, 0);
    Plane p("Y", 0.0, Vector3(128, 128, 128), Vector3(0, 0, 0), rot);
    Ray r(Vector3(0, -10, 0), Vector3(0, 1, 0));
    HitRecord rec;

    bool hit = p.hit(r, 0.001, 1e9, rec);
    CHECK(hit);
    CHECK(rec.normal.y == 1.0);
}

TEST_CASE("Cylinder - basic hit") {
    Cylinder c(Vector3(0, 0, 0), 5.0, 20.0, Vector3(255, 128, 0));
    Ray r(Vector3(-20, 0, 0), Vector3(1, 0, 0));
    HitRecord rec;

    bool hit = c.hit(r, 0.001, 1e9, rec);
    CHECK(hit);
    CHECK(std::abs(rec.point.x - (-5.0)) < 1e-6);
}

TEST_CASE("Cylinder - miss (too high)") {
    Cylinder c(Vector3(0, 0, 0), 5.0, 20.0, Vector3(255, 128, 0));
    Ray r(Vector3(0, 100, -20), Vector3(0, 0, 1));
    HitRecord rec;

    bool hit = c.hit(r, 0.001, 1e9, rec);
    CHECK_FALSE(hit);
}

TEST_CASE("Cone - basic hit") {
    Cone co(Vector3(0, 0, 0), 5.0, 20.0, Vector3(255, 0, 128));
    Ray r(Vector3(-20, 0, 0), Vector3(1, 0, 0));
    HitRecord rec;

    bool hit = co.hit(r, 0.001, 1e9, rec);
    CHECK(hit);
}

TEST_CASE("Cone - miss (outside)") {
    Cone co(Vector3(0, 0, 0), 5.0, 20.0, Vector3(255, 0, 128));
    Ray r(Vector3(100, 0, -20), Vector3(0, 0, 1));
    HitRecord rec;

    bool hit = co.hit(r, 0.001, 1e9, rec);
    CHECK_FALSE(hit);
}


TEST_CASE("Primitive - reflectivity default") {
    Sphere s(Vector3(0, 0, 0), 5.0, Vector3(255, 0, 0));
    Ray r(Vector3(0, 0, -20), Vector3(0, 0, 1));
    HitRecord rec;

    s.hit(r, 0.001, 1e9, rec);
    CHECK(rec.reflectivity == 0.3);
    CHECK(rec.shininess == 32);
}
