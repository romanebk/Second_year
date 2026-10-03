#include "BackgroundMusic.hpp"
#include <filesystem>
#include <iostream>

namespace fs = std::filesystem;

BackgroundMusic *BackgroundMusic::s_active = nullptr;

std::string BackgroundMusic::findTrack()
{
    const fs::path dir("assets/music");
    if (!fs::is_directory(dir))
        return {};

    static const char *exts[] = {".mp3", ".mpeg", ".ogg", ".wav", ".flac"};
    for (const auto &entry : fs::directory_iterator(dir)) {
        if (!entry.is_regular_file()) continue;
        std::string ext = entry.path().extension().string();
        for (const char *e : exts) {
            if (ext == e) return entry.path().string();
        }
        std::string name = entry.path().filename().string();
        if (name.find(".mp3") != std::string::npos
            || name.find(".mpeg") != std::string::npos)
            return entry.path().string();
    }
    return {};
}

bool BackgroundMusic::load()
{
    std::string path = findTrack();
    if (path.empty()) {
        std::cerr << "[audio] aucune piste dans assets/music/\n";
        return false;
    }
    if (!_music.openFromFile(path)) {
        std::cerr << "[audio] impossible de charger : " << path << "\n";
        return false;
    }
    _music.setLoop(true);
    _loaded = true;
    std::cout << "[audio] piste chargee : " << path << "\n";
    return true;
}

void BackgroundMusic::play(float volume)
{
    if (!_loaded) return;
    _volume = volume;
    _music.setVolume(_muted ? 0.f : _volume * 100.f);
    _music.play();
}

void BackgroundMusic::stop()
{
    if (_loaded) _music.stop();
}

void BackgroundMusic::toggleMute()
{
    if (!_loaded) return;
    _muted = !_muted;
    _music.setVolume(_muted ? 0.f : _volume * 100.f);
    std::cout << "[audio] " << (_muted ? "muet" : "son active") << "\n";
}

void BackgroundMusic::onKeyPressed(sf::Keyboard::Key key)
{
    if (s_active && key == sf::Keyboard::M)
        s_active->toggleMute();
}
