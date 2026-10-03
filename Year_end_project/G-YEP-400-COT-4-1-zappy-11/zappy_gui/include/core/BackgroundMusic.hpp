#pragma once

#include <SFML/Audio.hpp>
#include <SFML/Window/Keyboard.hpp>
#include <string>

class BackgroundMusic {
public:
    bool load();
    void play(float volume = 0.45f);
    void stop();
    void toggleMute();

    bool isLoaded() const { return _loaded; }
    bool isMuted()  const { return _muted; }

    static void setActive(BackgroundMusic *music) { s_active = music; }
    static void onKeyPressed(sf::Keyboard::Key key);

private:
    static std::string findTrack();

    static BackgroundMusic *s_active;

    sf::Music _music;
    bool      _loaded = false;
    bool      _muted  = false;
    float     _volume = 0.45f;
};
