/*
** EPITECH PROJECT, 2026
** Steganography.hpp
** File description:
** Audio steganography
*/

#ifndef STEGANOGRAPHY_HPP
#define STEGANOGRAPHY_HPP

#include <string>
#include "WavFile.hpp"

class Steganography {
public:
    static bool cypher(WavFile &wav, const std::string &message);
    static std::string decypher(const WavFile &wav);
};

#endif
