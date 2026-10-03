/* 
** EPITECH PROJECT, 2026
** Matrix4_cpp
** File description:
** implementation of a 4x4 matrix
*/

#include "../../include/Math/Matrix4.hpp"

Matrix4::Matrix4()
{
    for (int r = 0; r < 4; ++r)
        for (int c = 0; c < 4; ++c)
            m[r][c] = (r == c) ? 1.0 : 0.0;
}

Matrix4 Matrix4::identity()
{
    return Matrix4();
}

Matrix4 Matrix4::translation(double x, double y, double z)
{
    Matrix4 T = Matrix4::identity();
    T.m[0][3] = x;
    T.m[1][3] = y;
    T.m[2][3] = z;
    return T;
}

static double deg2rad(double d)
{
    return d * M_PI / 180.0;
}

Matrix4 Matrix4::rotationX(double angleDeg)
{
    double a = deg2rad(angleDeg);
    double c = cos(a), s = sin(a);
    Matrix4 R = Matrix4::identity();
    R.m[1][1] = c; R.m[1][2] = -s;
    R.m[2][1] = s; R.m[2][2] = c;
    return R;
}

Matrix4 Matrix4::rotationY(double angleDeg)
{
    double a = deg2rad(angleDeg);
    double c = cos(a), s = sin(a);
    Matrix4 R = Matrix4::identity();
    R.m[0][0] = c; R.m[0][2] = s;
    R.m[2][0] = -s; R.m[2][2] = c;
    return R;
}

Matrix4 Matrix4::rotationZ(double angleDeg)
{
    double a = deg2rad(angleDeg);
    double c = cos(a), s = sin(a);
    Matrix4 R = Matrix4::identity();
    R.m[0][0] = c; R.m[0][1] = -s;
    R.m[1][0] = s; R.m[1][1] = c;
    return R;
}

Matrix4 Matrix4::fromEuler(double xDeg, double yDeg, double zDeg)
{
    Matrix4 rx = rotationX(xDeg);
    Matrix4 ry = rotationY(yDeg);
    Matrix4 rz = rotationZ(zDeg);
    return rz * ry * rx;
}

Matrix4 Matrix4::operator*(const Matrix4& other) const
{
    Matrix4 r;
    for (int i = 0; i < 4; ++i) {
        for (int j = 0; j < 4; ++j) {
            double sum = 0.0;
            for (int k = 0; k < 4; ++k)
                sum += m[i][k] * other.m[k][j];
            r.m[i][j] = sum;
        }
    }
    return r;
}

Vector3 Matrix4::operator*(const Vector3& v) const
{
    double x = m[0][0]*v.x + m[0][1]*v.y + m[0][2]*v.z + m[0][3]*1.0;
    double y = m[1][0]*v.x + m[1][1]*v.y + m[1][2]*v.z + m[1][3]*1.0;
    double z = m[2][0]*v.x + m[2][1]*v.y + m[2][2]*v.z + m[2][3]*1.0;
    double w = m[3][0]*v.x + m[3][1]*v.y + m[3][2]*v.z + m[3][3]*1.0;
    if (w == 0.0) w = 1.0;
    return Vector3(x / w, y / w, z / w);
}

Matrix4 Matrix4::transpose() const
{
    Matrix4 t;
    for (int r = 0; r < 4; ++r)
        for (int c = 0; c < 4; ++c)
            t.m[r][c] = m[c][r];
    return t;
}

Matrix4 Matrix4::inverse() const
{
    Matrix4 inv = Matrix4::identity();
    for (int r = 0; r < 3; ++r)
        for (int c = 0; c < 3; ++c)
            inv.m[r][c] = m[c][r];
    double tx = m[0][3], ty = m[1][3], tz = m[2][3];
    inv.m[0][3] = -(inv.m[0][0]*tx + inv.m[0][1]*ty + inv.m[0][2]*tz);
    inv.m[1][3] = -(inv.m[1][0]*tx + inv.m[1][1]*ty + inv.m[1][2]*tz);
    inv.m[2][3] = -(inv.m[2][0]*tx + inv.m[2][1]*ty + inv.m[2][2]*tz);
    return inv;
}

double Matrix4::get(int row, int col) const
{
    return m[row][col];
}

void Matrix4::set(int row, int col, double value)
{
    m[row][col] = value;
}
