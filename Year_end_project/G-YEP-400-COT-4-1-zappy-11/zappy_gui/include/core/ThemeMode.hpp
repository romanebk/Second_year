#pragma once
#include <string>

enum class ThemeMode {
    Yavin,
    Tatooine,
    Jedha
};

inline const char* themeName(ThemeMode m) {
    switch (m) {
        case ThemeMode::Yavin:    return "Yavin";
        case ThemeMode::Tatooine: return "Tatooine";
        case ThemeMode::Jedha:    return "Jedha";
    }
    return "";
}

inline std::string themeFolder(ThemeMode m) {
    switch (m) {
        case ThemeMode::Yavin:    return "yavin";
        case ThemeMode::Tatooine: return "tatooine";
        case ThemeMode::Jedha:    return "jedha";
    }
    return "";
}
