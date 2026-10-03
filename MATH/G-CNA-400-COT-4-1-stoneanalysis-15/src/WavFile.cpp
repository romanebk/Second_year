/*
** EPITECH PROJECT, 2026
** WavFile.cpp
** File description:
** WAV file reading and writing
*/

#include "WavFile.hpp"
#include <fstream>
#include <iostream>
#include <cstring>

bool WavFile::load(const std::string &filename)
{
    std::ifstream file(filename, std::ios::binary);
    if (!file) {
        std::cerr << "Error: cannot open file " << filename << std::endl;
        return false;
    }

    file.read(reinterpret_cast<char *>(&header), sizeof(WavHeader));
    if (!file) {
        std::cerr << "Error: cannot read WAV header" << std::endl;
        return false;
    }

    if (std::strncmp(header.riff, "RIFF", 4) != 0) {
        std::cerr << "Error: not a RIFF file" << std::endl;
        return false;
    }

    if (std::strncmp(header.wave, "WAVE", 4) != 0) {
        std::cerr << "Error: not a WAVE file" << std::endl;
        return false;
    }

    if (header.audioFormat != 1) {
        std::cerr << "Error: unsupported audio format ("
                  << header.audioFormat << "), only PCM (1) is supported"
                  << std::endl;
        return false;
    }

    if (header.numChannels != 1) {
        std::cerr << "Error: unsupported channel count ("
                  << header.numChannels << "), only mono is supported"
                  << std::endl;
        return false;
    }

    if (header.bitsPerSample != 16) {
        std::cerr << "Error: unsupported bit depth ("
                  << header.bitsPerSample << "), only 16-bit is supported"
                  << std::endl;
        return false;
    }

    size_t numSamples = static_cast<size_t>(header.dataSize) / sizeof(int16_t);

    if (numSamples == 0) {
        std::cerr << "Error: no sample data in WAV file" << std::endl;
        return false;
    }

    samples.resize(numSamples);
    file.read(reinterpret_cast<char *>(samples.data()), header.dataSize);

    if (!file) {
        std::cerr << "Error: cannot read sample data (truncated file?)"
                  << std::endl;
        return false;
    }

    return true;
}

bool WavFile::save(const std::string &filename) const
{
    std::ofstream file(filename, std::ios::binary);
    if (!file) {
        std::cerr << "Error: cannot create file " << filename << std::endl;
        return false;
    }

    WavHeader hdr = header;
    hdr.dataSize = static_cast<uint32_t>(samples.size() * sizeof(int16_t));
    hdr.fileSize = sizeof(WavHeader) - 8 + hdr.dataSize;

    file.write(reinterpret_cast<const char *>(&hdr), sizeof(WavHeader));
    file.write(reinterpret_cast<const char *>(samples.data()),
               samples.size() * sizeof(int16_t));

    if (!file) {
        std::cerr << "Error: failed to write WAV file" << std::endl;
        return false;
    }

    return true;
}

double WavFile::getDuration() const
{
    return static_cast<double>(samples.size()) / header.sampleRate;
}

void WavFile::removeDC()
{
    if (samples.empty())
        return;

    int64_t sum = 0;
    for (auto s : samples)
        sum += s;
    int64_t dc = sum / static_cast<int64_t>(samples.size());

    if (dc == 0)
        return;

    for (auto &s : samples) {
        int32_t val = static_cast<int32_t>(s) - static_cast<int32_t>(dc);
        if (val > 32767) val = 32767;
        if (val < -32768) val = -32768;
        s = static_cast<int16_t>(val);
    }
}
