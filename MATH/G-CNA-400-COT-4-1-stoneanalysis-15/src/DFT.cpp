/*
** EPITECH PROJECT, 2026
** DFT.cpp
** File description:
** Discrete Fourier Transform and FFT
*/

#include "DFT.hpp"
#include <cmath>
#include <vector>
#include <algorithm>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

static bool isPowerOf2(size_t n)
{
    return n > 0 && (n & (n - 1)) == 0;
}

static void fftRadix2(std::vector<Complex> &a, bool inverse)
{
    size_t N = a.size();

    for (size_t i = 1, j = 0; i < N; ++i) {
        size_t bit = N >> 1;
        for (; j & bit; bit >>= 1)
            j ^= bit;
        j ^= bit;
        if (i < j)
            std::swap(a[i], a[j]);
    }
    for (size_t len = 2; len <= N; len <<= 1) {
        double ang = 2.0 * M_PI / static_cast<double>(len)
                     * (inverse ? 1.0 : -1.0);
        Complex wlen(std::cos(ang), std::sin(ang));
        for (size_t i = 0; i < N; i += len) {
            Complex w(1.0, 0.0);
            for (size_t j = 0; j < len / 2; ++j) {
                size_t idx = i + j;
                size_t idx2 = idx + len / 2;
                Complex v = a[idx2] * w;
                a[idx2] = a[idx] - v;
                a[idx] = a[idx] + v;
                w = w * wlen;
            }
        }
    }

    if (inverse) {
        double invN = 1.0 / static_cast<double>(N);
        for (size_t i = 0; i < N; ++i)
            a[i] = Complex(a[i].real * invN, a[i].imag * invN);
    }
}

void fft(std::vector<Complex> &a, bool inverse)
{
    size_t N = a.size();
    if (N <= 1) return;

    if (isPowerOf2(N)) {
        fftRadix2(a, inverse);
        return;
    }

    size_t M = 1;
    while (M < 2 * N)
        M <<= 1;

    const double sign = inverse ? 1.0 : -1.0;
    const double base = sign * M_PI / static_cast<double>(N);

    std::vector<Complex> chirpA(M), chirpB(M);

    for (size_t n = 0; n < N; ++n) {
        double ang = base * (static_cast<double>(n) * static_cast<double>(n));
        Complex w(std::cos(ang), std::sin(ang));
        chirpA[n] = a[n] * w;
        chirpB[n] = Complex(w.real, -w.imag);
    }
    for (size_t n = 1; n < N; ++n) {
        double ang = base * (static_cast<double>(n) * static_cast<double>(n));
        Complex w(std::cos(ang), std::sin(ang));
        chirpB[M - n] = Complex(w.real, -w.imag);
    }

    fftRadix2(chirpA, false);
    fftRadix2(chirpB, false);

    for (size_t i = 0; i < M; ++i)
        chirpA[i] = chirpA[i] * chirpB[i];

    fftRadix2(chirpA, true);

    const double norm = inverse ? 1.0 / static_cast<double>(N) : 1.0;
    for (size_t k = 0; k < N; ++k) {
        double ang = base * (static_cast<double>(k) * static_cast<double>(k));
        Complex w(std::cos(ang), std::sin(ang));
        a[k] = chirpA[k] * w;
        a[k] = Complex(a[k].real * norm, a[k].imag * norm);
    }
}


std::vector<Complex> dft(const std::vector<int16_t> &samples)
{
    const size_t N = samples.size();
    std::vector<Complex> x(N);
    for (size_t i = 0; i < N; ++i)
        x[i] = Complex(static_cast<double>(samples[i]), 0.0);
    fft(x, false);
    return x;
}

std::vector<Complex> dft(const std::vector<double> &samples)
{
    const size_t N = samples.size();
    std::vector<Complex> x(N);
    for (size_t i = 0; i < N; ++i)
        x[i] = Complex(samples[i], 0.0);
    fft(x, false);
    return x;
}

std::vector<Complex> dft(const std::vector<Complex> &input)
{
    std::vector<Complex> x = input;
    fft(x, false);
    return x;
}

std::vector<int16_t> idft(const std::vector<Complex> &freqs)
{
    const size_t N = freqs.size();
    std::vector<Complex> a = freqs;
    fft(a, true);
    std::vector<int16_t> result(N);
    for (size_t i = 0; i < N; ++i) {
        double val = a[i].real;
        if (val > 32767.0) val = 32767.0;
        if (val < -32768.0) val = -32768.0;
        result[i] = static_cast<int16_t>(std::round(val));
    }
    return result;
}
