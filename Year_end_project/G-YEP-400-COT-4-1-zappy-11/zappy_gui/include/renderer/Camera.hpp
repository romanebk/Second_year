#pragma once

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <SFML/Window/Event.hpp>
#include <SFML/Window/Mouse.hpp>
#include <SFML/Window/Window.hpp>

class Camera {
public:
    enum class Mode { FreeFly, Orbital };

    Camera();

    void setWindowSize(unsigned w, unsigned h);
    void captureMouse(sf::Window &window, bool capture);

    void setStartPosition(const glm::vec3 &pos, float yaw = -90.f, float pitch = 0.f);

    void setTarget(float cx, float cz);

    
    
    
    void frameMap(float centerX, float centerZ, float worldRadius);

    void setMode(Mode mode, sf::Window &window);
    void toggleMode(sf::Window &window);
    Mode getMode() const { return _mode; }

    void followTarget(float cx, float cz, float dt);
    void clearFollow();

    bool handleEvent(const sf::Event &event, sf::Window &window);
    void update(float dt);
    void resetKeys();

    glm::mat4 getView()                   const;
    glm::mat4 getProjection(float aspect) const;

    glm::vec3 getPosition() const;
    bool      isMouseCaptured() const { return _mouseCaptured; }

private:
    void clampPitchFreeFly();
    glm::vec3 forwardVector() const;
    glm::vec3 rightVector()   const;

    void clampPitchOrbital();
    void clampDistOrbital();

    Mode _mode = Mode::FreeFly;

    unsigned _winW = 1280, _winH = 720;
    bool     _mouseCaptured = false;

    glm::vec3 _ffPosition { 0.f, 1.5f, 8.f };
    float     _ffYaw   = -90.f;
    float     _ffPitch = 0.f;

    glm::vec3 _ffStartPosition { 0.f, 1.5f, 8.f };
    float     _ffStartYaw   = -90.f;
    float     _ffStartPitch = 0.f;

    bool _keyForward = false, _keyBack  = false;
    bool _keyLeft    = false, _keyRight = false;
    bool _keyUp      = false, _keyDown  = false;
    bool _keyBoost   = false;

    static constexpr float MOUSE_SENSITIVITY = 0.12f;
    static constexpr float MOVE_SPEED        = 3.5f;
    static constexpr float BOOST_MULTIPLIER  = 2.8f;
    static constexpr float FF_PITCH_LIMIT    = 89.f;

    glm::vec3 _obCenter { 0.f, 0.f, 0.f };
    glm::vec3 _obTarget { 0.f, 0.f, 0.f };
    float _obYaw   = 45.f;
    float _obPitch = 35.264f;
    float _obDist  = 20.f;

    float _obVelYaw   = 0.f;
    float _obVelPitch = 0.f;
    float _obVelZoom  = 0.f;

    bool         _obLeftDrag  = false;
    bool         _obRightDrag = false;
    sf::Vector2i _obLastMouse { 0, 0 };

    bool  _following = false;
    float _followX = 0.f, _followZ = 0.f;

    bool _obKeyLeft  = false, _obKeyRight = false;
    bool _obKeyUp    = false, _obKeyDown  = false;
    bool _obKeyZoomIn = false, _obKeyZoomOut = false;

    static constexpr float OB_ROT_SPEED      = 0.35f;
    static constexpr float OB_PAN_SPEED      = 0.015f;
    static constexpr float OB_SCROLL_ZOOM    = 0.12f;
    static constexpr float OB_KEY_ROT_ACCEL  = 120.f;
    static constexpr float OB_KEY_ZOOM_ACCEL = 1.5f;
    static constexpr float OB_DAMPING        = 8.f;
    static constexpr float OB_PITCH_MIN      = 5.f;
    static constexpr float OB_PITCH_MAX      = 89.f;
    static constexpr float OB_DIST_MIN       = 2.f;
    static constexpr float OB_DIST_MAX       = 400.f;
};
