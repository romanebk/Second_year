/*
** EPITECH PROJECT, 2026
** Matrix4_hpp
** File description:
** header of a 4x4 matrix
*/

#ifndef MATRIX4_HPP_
#define MATRIX4_HPP_

#include "Vector3.hpp"
#include <cmath>

class Matrix4 {

    private:
        double m[4][4];

    public:
        Matrix4();

        static Matrix4 identity();
        static Matrix4 translation(double x, double y, double z);
        static Matrix4 rotationX(double angleDeg);
        static Matrix4 rotationY(double angleDeg);
        static Matrix4 rotationZ(double angleDeg);

        static Matrix4 fromEuler(double xDeg, double yDeg, double zDeg);

        Matrix4 operator*(const Matrix4& other) const;
        Vector3 operator*(const Vector3& v) const;

        Matrix4 transpose() const;
        Matrix4 inverse() const;

        double get(int row, int col) const;
        void set(int row, int col, double value);
};

#endif
