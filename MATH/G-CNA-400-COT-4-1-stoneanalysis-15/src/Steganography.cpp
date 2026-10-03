/*
** EPITECH PROJECT, 2026
** Steganography.cpp
** File description:
** Audio steganography encoding/decoding
*/

#include "Steganography.hpp"
#include "DFT.hpp"
#include <iostream>
#include <algorithm>
#include <cstdint>
#include <cmath>
#include <cctype>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

namespace {
    constexpr size_t CHAR_MAP_SIZE = 95;
    constexpr size_t CHUNK_SIZE = 1024;
    constexpr size_t START_BIN = 400;
    constexpr double AMPLITUDE = 300.0;
    constexpr double DECODE_THRESHOLD = 10000.0;
    constexpr size_t SAMPLE_RATE = 48000;
    constexpr size_t LEN_CHUNKS = 2;

    void applyHannWindow(std::vector<double> &windowed,
                         const std::vector<int16_t> &chunk)
    {
        if (chunk.size() <= 1) return;
        for (size_t n = 0; n < chunk.size(); ++n) {
            double w = 0.5 * (1.0 - std::cos(2.0 * M_PI * n
                             / (chunk.size() - 1)));
            windowed[n] = static_cast<double>(chunk[n]) * w;
        }
    }

    int charToIndex(char c)
    {
        if (c >= 32 && c <= 126)
            return static_cast<int>(c) - 32;
        return -1;
    }

    char indexToChar(int idx)
    {
        if (idx >= 0 && idx <= 94)
            return static_cast<char>(32 + idx);
        return '?';
    }

    double charToFreq(int charIdx)
    {
        return static_cast<double>(START_BIN + charIdx)
               * SAMPLE_RATE / CHUNK_SIZE;
    }

    void addTone(std::vector<int16_t> &chunk, int charIdx, double amp)
    {
        double freq = charToFreq(charIdx);
        for (size_t n = 0; n < chunk.size(); ++n) {
            double val = static_cast<double>(chunk[n]);
            val += amp * std::sin(2.0 * M_PI * freq * n / SAMPLE_RATE);
            if (val > 32767.0) val = 32767.0;
            if (val < -32768.0) val = -32768.0;
            chunk[n] = static_cast<int16_t>(std::round(val));
        }
    }

    int detectTone(const std::vector<int16_t> &chunk)
    {
        std::vector<double> windowed(chunk.size());
        applyHannWindow(windowed, chunk);

        std::vector<int16_t> wavChunk(chunk.size());
        for (size_t i = 0; i < chunk.size(); ++i) {
            double v = windowed[i];
            if (v > 32767.0) v = 32767.0;
            if (v < -32768.0) v = -32768.0;
            wavChunk[i] = static_cast<int16_t>(std::round(v));
        }

        auto spectrum = dft(wavChunk);

        size_t bestBin = START_BIN;
        double bestMag = 0.0;

        for (size_t b = START_BIN; b < START_BIN + CHAR_MAP_SIZE; ++b) {
            double mag = spectrum[b].magnitude();
            if (mag > bestMag) {
                bestMag = mag;
                bestBin = b;
            }
        }

        if (bestMag < DECODE_THRESHOLD)
            return -1;

        return static_cast<int>(bestBin - START_BIN);
    }
}

namespace {
    void encodeChunk(WavFile &wav, size_t chunkIdx, int charIdx, double amp)
    {
        size_t start = chunkIdx * CHUNK_SIZE;
        std::vector<int16_t> chunk(
            wav.samples.begin() + start,
            wav.samples.begin() + start + CHUNK_SIZE
        );
        addTone(chunk, charIdx, amp);
        std::copy(chunk.begin(), chunk.end(),
                  wav.samples.begin() + start);
    }

    int decodeChunk(const WavFile &wav, size_t chunkIdx)
    {
        size_t start = chunkIdx * CHUNK_SIZE;
        std::vector<int16_t> chunk(
            wav.samples.begin() + start,
            wav.samples.begin() + start + CHUNK_SIZE
        );
        return detectTone(chunk);
    }
}

bool Steganography::cypher(WavFile &wav, const std::string &message)
{
    std::string msg = message;
    std::transform(msg.begin(), msg.end(), msg.begin(),
        [](unsigned char c) { return static_cast<char>(std::toupper(c)); });

    for (char c : msg) {
        if (charToIndex(c) < 0) {
            std::cerr << "Error: invalid character '" << c
                      << "' (code " << static_cast<int>(c)
                      << ") in message" << std::endl;
            return false;
        }
    }

    size_t totalSamples = wav.samples.size();
    size_t maxChunks = totalSamples / CHUNK_SIZE;
    size_t neededChunks = LEN_CHUNKS + msg.size();

    if (msg.empty()) {
        std::cerr << "Error: empty message" << std::endl;
        return false;
    }

    if (neededChunks > maxChunks) {
        std::cerr << "Error: message too long for audio file" << std::endl;
        return false;
    }

    if (totalSamples < CHUNK_SIZE * LEN_CHUNKS) {
        std::cerr << "Error: audio file too small" << std::endl;
        return false;
    }

    int lenHi = static_cast<int>(msg.size() / CHAR_MAP_SIZE);
    int lenLo = static_cast<int>(msg.size() % CHAR_MAP_SIZE);

    encodeChunk(wav, 0, lenHi, AMPLITUDE);
    encodeChunk(wav, 1, lenLo, AMPLITUDE);

    for (size_t i = 0; i < msg.size(); ++i) {
        int charIdx = charToIndex(msg[i]);
        encodeChunk(wav, LEN_CHUNKS + i, charIdx, AMPLITUDE);
    }

    return true;
}

std::string Steganography::decypher(const WavFile &wav)
{
    size_t totalSamples = wav.samples.size();
    size_t maxChunks = totalSamples / CHUNK_SIZE;

    if (totalSamples < CHUNK_SIZE * LEN_CHUNKS) {
        std::cerr << "Error: audio file too small" << std::endl;
        return "";
    }

    int lenHi = decodeChunk(wav, 0);
    if (lenHi < 0)
        lenHi = 0;

    int lenLo = decodeChunk(wav, 1);
    if (lenLo < 0)
        lenLo = 0;

    size_t msgLength = static_cast<size_t>(lenHi * CHAR_MAP_SIZE + lenLo);

    if (msgLength == 0 || msgLength > maxChunks - LEN_CHUNKS) {
        std::cerr << "Error: no hidden message found" << std::endl;
        return "";
    }

    std::string result;
    for (size_t i = 0; i < msgLength; ++i) {
        int charIdx = decodeChunk(wav, LEN_CHUNKS + i);
        if (charIdx < 0) {
            std::cerr << "Error: failed to decode character at position "
                      << i << std::endl;
            return "";
        }
        result += indexToChar(charIdx);
    }

    return result;
}
