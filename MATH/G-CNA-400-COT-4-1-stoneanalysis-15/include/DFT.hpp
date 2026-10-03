/*
** EPITECH PROJECT, 2026
** DFT.hpp
** File description:
** Discrete Fourier Transform
*/

#ifndef DFT_HPP
#define DFT_HPP

#include <vector>
#include <cstdint>
#include "Complex.hpp"

void fft(std::vector<Complex> &a, bool inverse);

std::vector<Complex> dft(const std::vector<int16_t> &samples);
std::vector<Complex> dft(const std::vector<double> &samples);
std::vector<Complex> dft(const std::vector<Complex> &input);
std::vector<int16_t> idft(const std::vector<Complex> &freqs);

#endif
