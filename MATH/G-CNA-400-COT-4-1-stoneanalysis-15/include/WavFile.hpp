/*
** EPITECH PROJECT, 2026
** WavFile.hpp
** File description:
** WAV file I/O
*/

#ifndef WAVFILE_HPP
#define WAVFILE_HPP

#include <cstdint>
#include <string>
#include <vector>

struct __attribute__((packed)) WavHeader {
    char     riff[4];
    uint32_t fileSize;
    char     wave[4];
    char     fmt[4];
    uint32_t fmtSize;
    uint16_t audioFormat;
    uint16_t numChannels;
    uint32_t sampleRate;
    uint32_t byteRate;
    uint16_t blockAlign;
    uint16_t bitsPerSample;
    char     data[4];
    uint32_t dataSize;
};

class WavFile {
public:
    WavHeader header;
    std::vector<int16_t> samples;

    bool load(const std::string &filename);
    bool save(const std::string &filename) const;
    double getDuration() const;
    void removeDC();
};

#endif
