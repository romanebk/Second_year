#include "Camera.hpp"
#include <cmath>
#include <algorithm>

Camera::Camera() {}

void Camera::setWindowSize(unsigned w, unsigned h)
{
    _winW = w;
    _winH = h;
}

void Camera::captureMouse(sf::Window &window, bool capture)
{
    _mouseCaptured = capture;
    window.setMouseCursorVisible(!capture);
    window.setMouseCursorGrabbed(capture);
    if (capture)
        sf::Mouse::setPosition({(int)(_winW / 2), (int)(_winH / 2)}, window);
}

void Camera::setStartPosition(const glm::vec3 &pos, float yaw, float pitch)
{
    _ffStartPosition = pos;
    _ffStartYaw   = yaw;
    _ffStartPitch = pitch;
    _ffPosition = pos;
    _ffYaw   = yaw;
    _ffPitch = pitch;
}

void Camera::setTarget(float cx, float cz)
{
    _obCenter = glm::vec3(cx, 0.f, cz);
    _obTarget = _obCenter;
    _obDist   = std::max(OB_DIST_MIN, std::max(cx, cz) * 2.5f);
    clampDistOrbital();
}

void Camera::frameMap(float centerX, float centerZ, float worldRadius)
{
    const float pitchDeg = 35.f;

    
    
    float fitR = std::max(worldRadius, 4.f);
    float L = fitR / std::tan(glm::radians(30.f));
    L = std::max(L, 8.f);

    float rp = glm::radians(pitchDeg);
    float h  = L * std::sin(rp);   
    float zc = L * std::cos(rp);   

    
    setStartPosition(glm::vec3(centerX, h, centerZ + zc), -90.f, -pitchDeg);

    
    _obCenter = glm::vec3(centerX, 0.f, centerZ);
    _obTarget = _obCenter;
    _obYaw    = 45.f;
    _obPitch  = 35.264f;
    _obDist   = L;
    clampDistOrbital();
}

void Camera::setMode(Mode mode, sf::Window &window)
{
    if (_mode == mode) return;
    _mode = mode;

    resetKeys();
    _obLeftDrag = _obRightDrag = false;

    captureMouse(window, mode == Mode::FreeFly);
}

void Camera::toggleMode(sf::Window &window)
{
    setMode(_mode == Mode::FreeFly ? Mode::Orbital : Mode::FreeFly, window);
}

bool Camera::handleEvent(const sf::Event &ev, sf::Window &window)
{

    if (ev.type == sf::Event::KeyPressed && ev.key.code == sf::Keyboard::Tab) {
        toggleMode(window);
        return true;
    }

    if (_mode == Mode::FreeFly) {
        switch (ev.type) {
        case sf::Event::MouseMoved: {
            if (!_mouseCaptured) return false;
            int cx = (int)(_winW / 2), cy = (int)(_winH / 2);
            int dx = ev.mouseMove.x - cx;
            int dy = ev.mouseMove.y - cy;
            if (dx != 0 || dy != 0) {
                _ffYaw   += dx * MOUSE_SENSITIVITY;
                _ffPitch -= dy * MOUSE_SENSITIVITY;
                clampPitchFreeFly();
                sf::Mouse::setPosition({cx, cy}, window);
            }
            return true;
        }
        case sf::Event::KeyPressed:
            switch (ev.key.code) {
            case sf::Keyboard::Z: case sf::Keyboard::Up:    _keyForward = true; return true;
            case sf::Keyboard::S: case sf::Keyboard::Down:  _keyBack    = true; return true;
            case sf::Keyboard::Q: case sf::Keyboard::Left:  _keyLeft    = true; return true;
            case sf::Keyboard::D: case sf::Keyboard::Right: _keyRight   = true; return true;
            case sf::Keyboard::Space:  _keyUp   = true; return true;
            case sf::Keyboard::LShift: _keyDown = true; _keyBoost = true; return true;
            case sf::Keyboard::R:
                _ffPosition = _ffStartPosition;
                _ffYaw      = _ffStartYaw;
                _ffPitch    = _ffStartPitch;
                return true;
            default: break;
            }
            return false;
        case sf::Event::KeyReleased:
            switch (ev.key.code) {
            case sf::Keyboard::Z: case sf::Keyboard::Up:    _keyForward = false; return false;
            case sf::Keyboard::S: case sf::Keyboard::Down:  _keyBack    = false; return false;
            case sf::Keyboard::Q: case sf::Keyboard::Left:  _keyLeft    = false; return false;
            case sf::Keyboard::D: case sf::Keyboard::Right: _keyRight   = false; return false;
            case sf::Keyboard::Space:  _keyUp   = false; return false;
            case sf::Keyboard::LShift: _keyDown = false; _keyBoost = false; return false;
            default: break;
            }
            return false;
        default:
            return false;
        }
    }

    switch (ev.type) {

    case sf::Event::MouseButtonPressed:
        if (ev.mouseButton.button == sf::Mouse::Left) {
            _obLeftDrag  = true;
            _obLastMouse = { ev.mouseButton.x, ev.mouseButton.y };
        }
        if (ev.mouseButton.button == sf::Mouse::Right) {
            _obRightDrag = true;
            _obLastMouse = { ev.mouseButton.x, ev.mouseButton.y };
        }
        return false;

    case sf::Event::MouseButtonReleased:
        if (ev.mouseButton.button == sf::Mouse::Left)  _obLeftDrag  = false;
        if (ev.mouseButton.button == sf::Mouse::Right) _obRightDrag = false;
        return false;

    case sf::Event::MouseMoved: {
        sf::Vector2i cur  = { ev.mouseMove.x, ev.mouseMove.y };
        sf::Vector2i diff = cur - _obLastMouse;

        if (_obLeftDrag) {
            _obYaw   += diff.x * OB_ROT_SPEED;
            _obPitch -= diff.y * OB_ROT_SPEED;
            clampPitchOrbital();
            _obLastMouse = cur;
            return true;
        }
        if (_obRightDrag) {
            _obLastMouse = cur;
            return false;
        }
        return false;
    }

    case sf::Event::MouseWheelScrolled: {
        float dir = (ev.mouseWheelScroll.delta > 0) ? -1.f : 1.f;
        _obVelZoom += dir * OB_SCROLL_ZOOM * _obDist;
        return true;
    }

    case sf::Event::KeyPressed:
        switch (ev.key.code) {
        case sf::Keyboard::R:
            _obYaw      = 45.f;
            _obPitch    = 35.264f;
            _obVelYaw   = 0.f;
            _obVelPitch = 0.f;
            _obVelZoom  = 0.f;
            _obTarget   = _obCenter;
            return true;
        default: break;
        }
        return false;

    default:
        return false;
    }
}

void Camera::update(float dt)
{
    if (_mode == Mode::FreeFly) {
        float speed = MOVE_SPEED * (_keyBoost ? BOOST_MULTIPLIER : 1.f);

        glm::vec3 fwd   = forwardVector();
        glm::vec3 right = rightVector();
        glm::vec3 up    { 0.f, 1.f, 0.f };

        glm::vec3 move(0.f);
        if (_keyForward) move += fwd;
        if (_keyBack)    move -= fwd;
        if (_keyRight)   move += right;
        if (_keyLeft)    move -= right;
        if (_keyUp)       move += up;
        if (_keyDown)     move -= up;

        if (glm::length(move) > 0.0001f)
            _ffPosition += glm::normalize(move) * speed * dt;
        return;
    }

    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Left)  ||
        sf::Keyboard::isKeyPressed(sf::Keyboard::Q))
        _obVelYaw -= OB_KEY_ROT_ACCEL * dt;
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Right) ||
        sf::Keyboard::isKeyPressed(sf::Keyboard::D))
        _obVelYaw += OB_KEY_ROT_ACCEL * dt;
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Up)   ||
        sf::Keyboard::isKeyPressed(sf::Keyboard::Z))
        _obVelPitch += OB_KEY_ROT_ACCEL * dt;
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Down) ||
        sf::Keyboard::isKeyPressed(sf::Keyboard::S))
        _obVelPitch -= OB_KEY_ROT_ACCEL * dt;

    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Add) ||
        sf::Keyboard::isKeyPressed(sf::Keyboard::Equal))
        _obVelZoom -= OB_KEY_ZOOM_ACCEL * _obDist * dt;
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Subtract) ||
        sf::Keyboard::isKeyPressed(sf::Keyboard::Hyphen))
        _obVelZoom += OB_KEY_ZOOM_ACCEL * _obDist * dt;

    _obYaw   += _obVelYaw   * dt;
    _obPitch += _obVelPitch * dt;
    _obDist  += _obVelZoom  * dt;

    clampPitchOrbital();
    clampDistOrbital();

    float decay = expf(-OB_DAMPING * dt);
    _obVelYaw   *= decay;
    _obVelPitch *= decay;
    _obVelZoom  *= decay;

    if (fabsf(_obVelYaw)   < 0.01f)  _obVelYaw   = 0.f;
    if (fabsf(_obVelPitch) < 0.01f)  _obVelPitch = 0.f;
    if (fabsf(_obVelZoom)  < 0.001f) _obVelZoom  = 0.f;
}

void Camera::resetKeys()
{
    _keyForward = _keyBack = _keyLeft = _keyRight = _keyUp = _keyDown = _keyBoost = false;
    _obKeyLeft = _obKeyRight = _obKeyUp = _obKeyDown = _obKeyZoomIn = _obKeyZoomOut = false;
}

glm::vec3 Camera::forwardVector() const
{
    float ry = glm::radians(_ffYaw);
    float rp = glm::radians(_ffPitch);
    return glm::normalize(glm::vec3(
        cosf(ry) * cosf(rp),
        sinf(rp),
        sinf(ry) * cosf(rp)
    ));
}

glm::vec3 Camera::rightVector() const
{
    return glm::normalize(glm::cross(forwardVector(), glm::vec3(0.f, 1.f, 0.f)));
}

glm::vec3 Camera::getPosition() const
{
    if (_mode == Mode::FreeFly) return _ffPosition;

    float radYaw   = glm::radians(_obYaw);
    float radPitch = glm::radians(_obPitch);
    return glm::vec3(
        _obTarget.x + _obDist * cosf(radPitch) * sinf(radYaw),
        _obTarget.y + _obDist * sinf(radPitch),
        _obTarget.z + _obDist * cosf(radPitch) * cosf(radYaw)
    );
}

glm::mat4 Camera::getView() const
{
    if (_mode == Mode::FreeFly)
        return glm::lookAt(_ffPosition, _ffPosition + forwardVector(), glm::vec3(0.f, 1.f, 0.f));

    return glm::lookAt(getPosition(), _obTarget, glm::vec3(0.f, 1.f, 0.f));
}

glm::mat4 Camera::getProjection(float aspect) const
{
    float fov = (_mode == Mode::FreeFly) ? 70.f : 45.f;
    return glm::perspective(glm::radians(fov), aspect, 0.05f, 500.f);
}

void Camera::clampPitchFreeFly()
{
    if (_ffPitch >  FF_PITCH_LIMIT) _ffPitch =  FF_PITCH_LIMIT;
    if (_ffPitch < -FF_PITCH_LIMIT) _ffPitch = -FF_PITCH_LIMIT;
}

void Camera::clampPitchOrbital()
{
    if (_obPitch < OB_PITCH_MIN) { _obPitch = OB_PITCH_MIN; _obVelPitch = 0.f; }
    if (_obPitch > OB_PITCH_MAX) { _obPitch = OB_PITCH_MAX; _obVelPitch = 0.f; }
}

void Camera::clampDistOrbital()
{
    if (_obDist < OB_DIST_MIN) { _obDist = OB_DIST_MIN; _obVelZoom = 0.f; }
    if (_obDist > OB_DIST_MAX) { _obDist = OB_DIST_MAX; _obVelZoom = 0.f; }
}

void Camera::followTarget(float cx, float cz, float dt)
{
    _following = true;
    _followX = cx;
    _followZ = cz;
    float lerp = std::min(1.f, dt * 4.f);
    _obTarget.x += (cx - _obTarget.x) * lerp;
    _obTarget.z += (cz - _obTarget.z) * lerp;
}

void Camera::clearFollow()
{
    _following = false;
}
