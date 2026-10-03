/*
** EPITECH PROJECT, 2026
** Analyzer.cpp
** File description:
** Frequency analysis
*/

#include "Analyzer.hpp"
#include <algorithm>
#include <cmath>

static std::vector<std::pair<double, double>> getMagnitudes(
    const std::vector<Complex> &spectrum, size_t sampleRate)
{
    const size_t N = spectrum.size();
    if (N == 0) return {};
    std::vector<std::pair<double, double>> mags;
    mags.reserve(N / 2 + 1);

    for (size_t i = 0; i <= N / 2; ++i) {
        const double freq = static_cast<double>(i)
                            * static_cast<double>(sampleRate)
                            / static_cast<double>(N);
        const double mag = spectrum[i].magnitude();
        mags.emplace_back(freq, mag);
    }

    return mags;
}

std::vector<std::pair<double, double>> Analyzer::getTopFrequencies(
    const std::vector<Complex> &spectrum, size_t sampleRate, size_t n)
{
    auto mags = getMagnitudes(spectrum, sampleRate);
    std::partial_sort(mags.begin(),
                      mags.begin() + std::min(n, mags.size()),
                      mags.end(),
                      [](const auto &a, const auto &b) {
                          return a.second > b.second;
                      });

    std::vector<std::pair<double, double>> top;
    for (size_t i = 0; i < std::min(n, mags.size()); ++i)
        top.push_back(mags[i]);
    return top;
}
