#pragma once

#include <optional>
#include <string>
#include <vector>

namespace BroadcastCodec {

bool isHexBlob(const std::string &s);

std::optional<std::string> decode(const std::string &blob, const std::string &team);

std::string displayText(const std::string &raw, const std::string &senderTeam);

} 
