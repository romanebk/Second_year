/*
** EPITECH PROJECT, 2026
** Analyzer.hpp
** File description:
** Frequency spectrum analyzer
*/

#ifndef ANALYZER_HPP
#define ANALYZER_HPP

#include <cstddef>
#include <vector>
#include <utility>
#include "Complex.hpp"

class Analyzer {
public:
    static std::vector<std::pair<double, double>> getTopFrequencies(
        const std::vector<Complex> &spectrum,
        size_t sampleRate,
        size_t n
    );
};

#endif
