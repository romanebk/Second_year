#include "BroadcastCodec.hpp"

#include <algorithm>
#include <cctype>

namespace BroadcastCodec {

static constexpr const char *MAGIC = "ZP1:";

static std::vector<unsigned char> keyBytes(const std::string &team)
{
    std::string kb = team.empty() ? "zappy" : team;
    return {kb.begin(), kb.end()};
}

static std::vector<unsigned char> xorData(const std::vector<unsigned char> &data,
                                          const std::vector<unsigned char> &kb)
{
    if (kb.empty()) return data;
    std::vector<unsigned char> out(data.size());
    for (size_t i = 0; i < data.size(); ++i)
        out[i] = data[i] ^ kb[i % kb.size()];
    return out;
}

static std::optional<std::vector<unsigned char>> fromHex(const std::string &hex)
{
    std::string t;
    t.reserve(hex.size());
    for (char c : hex) {
        if (!std::isspace(static_cast<unsigned char>(c)))
            t.push_back(c);
    }
    if (t.size() < 2 || (t.size() % 2) != 0)
        return std::nullopt;

    std::vector<unsigned char> out;
    out.reserve(t.size() / 2);
    auto nybble = [](char c) -> int {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        return -1;
    };
    for (size_t i = 0; i < t.size(); i += 2) {
        int hi = nybble(t[i]), lo = nybble(t[i + 1]);
        if (hi < 0 || lo < 0) return std::nullopt;
        out.push_back(static_cast<unsigned char>((hi << 4) | lo));
    }
    return out;
}

bool isHexBlob(const std::string &s)
{
    if (s.size() < 4) return false;
    int hexCount = 0;
    for (char c : s) {
        if (std::isspace(static_cast<unsigned char>(c))) continue;
        if (!std::isxdigit(static_cast<unsigned char>(c))) return false;
        ++hexCount;
    }
    return hexCount >= 4 && (hexCount % 2) == 0;
}

std::optional<std::string> decode(const std::string &blob, const std::string &team)
{
    auto data = fromHex(blob);
    if (!data) return std::nullopt;

    auto plain = xorData(*data, keyBytes(team));
    std::string text(plain.begin(), plain.end());

    if (text.size() >= 4 && text.compare(0, 4, MAGIC) == 0)
        return text.substr(4);
    return std::nullopt;
}

std::string displayText(const std::string &raw, const std::string &senderTeam)
{
    if (auto clear = decode(raw, senderTeam))
        return *clear;

    if (isHexBlob(raw))
        return "[chiffre]";

    return raw;
}

} 
