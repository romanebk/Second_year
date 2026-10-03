#pragma once
#include <string>




enum class ThemeMode {
    DeckImperial,
    HoloTactique,
    ScanOrbital
};

inline const char* themeName(ThemeMode m) {
    switch (m) {
        case ThemeMode::DeckImperial: return "Deck Impérial";
        case ThemeMode::HoloTactique: return "Holo-Tactique";
        case ThemeMode::ScanOrbital:  return "Scan Orbital";
    }
    return "";
}

inline std::string themeFolder(ThemeMode m) {
    switch (m) {
        case ThemeMode::DeckImperial: return "Deck_Impérial";
        case ThemeMode::HoloTactique: return "Holo-Tactique";
        case ThemeMode::ScanOrbital:  return "Scan_Orbital";
    }
    return "";
}

inline std::string themeTexturePath(ThemeMode m) {
    return "assets/textures/" + themeFolder(m) + "/floor.png";
}
