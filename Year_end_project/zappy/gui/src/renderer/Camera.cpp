#include "renderer/Camera.hpp"
#include <cmath>
#include <algorithm>

Camera::Camera() {}

void Camera::resetKeys() {
    _keyLeft = _keyRight = _keyUp = _keyDown = false;
    _keyZoomIn = _keyZoomOut = false;
    _leftDrag  = _rightDrag  = false;
}

void Camera::setTarget(float cx, float cz)
{
    _center = glm::vec3(cx, 0.f, cz);
    _target = _center;
    _dist   = std::max(DIST_MIN, std::max(cx, cz) * 2.5f);
    clampDist();
}


bool Camera::handleEvent(const sf::Event &ev)
{
    switch (ev.type) {

    
    case sf::Event::MouseButtonPressed:
        if (ev.mouseButton.button == sf::Mouse::Left) {
            _leftDrag  = true;
            _lastMouse = { ev.mouseButton.x, ev.mouseButton.y };
        }
        if (ev.mouseButton.button == sf::Mouse::Right) {
            _rightDrag = true;
            _lastMouse = { ev.mouseButton.x, ev.mouseButton.y };
        }
        return false;

    case sf::Event::MouseButtonReleased:
        if (ev.mouseButton.button == sf::Mouse::Left)  _leftDrag  = false;
        if (ev.mouseButton.button == sf::Mouse::Right) _rightDrag = false;
        return false;

    
    case sf::Event::MouseMoved: {
        sf::Vector2i cur  = { ev.mouseMove.x, ev.mouseMove.y };
        sf::Vector2i diff = cur - _lastMouse;

        if (_leftDrag) {
            
            _yaw   += diff.x * ROT_SPEED;
            _pitch -= diff.y * ROT_SPEED;
            clampPitch();
            _lastMouse = cur;
            return true;
        }
        if (_rightDrag) {
            
            _lastMouse = cur;
            return false;
        }
        return false;
    }

    
    case sf::Event::MouseWheelScrolled: {
        
        float dir = (ev.mouseWheelScroll.delta > 0) ? -1.f : 1.f;
        _velZoom += dir * SCROLL_ZOOM * _dist;
        return true;
    }

    
    case sf::Event::KeyPressed:
        switch (ev.key.code) {
        case sf::Keyboard::Left:  case sf::Keyboard::Q: _keyLeft    = true; return true;
        case sf::Keyboard::Right: case sf::Keyboard::D: _keyRight   = true; return true;
        case sf::Keyboard::Up:    case sf::Keyboard::Z: _keyUp      = true; return true;
        case sf::Keyboard::Down:  case sf::Keyboard::S: _keyDown    = true; return true;
        case sf::Keyboard::Add:   case sf::Keyboard::Equal: _keyZoomIn  = true; return true;
        case sf::Keyboard::Subtract: case sf::Keyboard::Hyphen: _keyZoomOut = true; return true;
        case sf::Keyboard::R:
            
            _yaw      = 45.f;
            _pitch    = 35.264f;
            _velYaw   = 0.f;
            _velPitch = 0.f;
            _velZoom  = 0.f;
            _target  = _center;
            return true;
        default: break;
        }
        return false;

    
    case sf::Event::KeyReleased:
        switch (ev.key.code) {
        case sf::Keyboard::Left:  case sf::Keyboard::Q: _keyLeft    = false; return false;
        case sf::Keyboard::Right: case sf::Keyboard::D: _keyRight   = false; return false;
        case sf::Keyboard::Up:    case sf::Keyboard::Z: _keyUp      = false; return false;
        case sf::Keyboard::Down:  case sf::Keyboard::S: _keyDown    = false; return false;
        case sf::Keyboard::Add:   case sf::Keyboard::Equal: _keyZoomIn  = false; return false;
        case sf::Keyboard::Subtract: case sf::Keyboard::Hyphen: _keyZoomOut = false; return false;
        default: break;
        }
        return false;

    default:
        return false;
    }
}




void Camera::update(float dt)
{
    
    if (_keyLeft)    _velYaw   -= KEY_ROT_ACCEL  * dt;
    if (_keyRight)   _velYaw   += KEY_ROT_ACCEL  * dt;
    if (_keyUp)      _velPitch += KEY_ROT_ACCEL  * dt;
    if (_keyDown)    _velPitch -= KEY_ROT_ACCEL  * dt;
    if (_keyZoomIn)  _velZoom  -= KEY_ZOOM_ACCEL * _dist * dt;
    if (_keyZoomOut) _velZoom  += KEY_ZOOM_ACCEL * _dist * dt;

    
    _yaw   += _velYaw   * dt;
    _pitch += _velPitch * dt;
    _dist  += _velZoom  * dt;
    
    clampPitch();
    clampDist();

    
    
    float decay = expf(-DAMPING * dt);

    
    if (!_keyLeft  && !_keyRight) _velYaw   *= decay;
    if (!_keyUp    && !_keyDown)  _velPitch *= decay;
    if (!_keyZoomIn && !_keyZoomOut) _velZoom *= decay;

    
    if (fabsf(_velYaw)   < 0.01f) _velYaw   = 0.f;
    if (fabsf(_velPitch) < 0.01f) _velPitch = 0.f;
    if (fabsf(_velZoom)  < 0.001f) _velZoom = 0.f;
}


glm::mat4 Camera::getView() const
{
    float radYaw   = glm::radians(_yaw);
    float radPitch = glm::radians(_pitch);

    glm::vec3 eye(
        _target.x + _dist * cosf(radPitch) * sinf(radYaw),
        _target.y + _dist * sinf(radPitch),
        _target.z + _dist * cosf(radPitch) * cosf(radYaw)
    );

    return glm::lookAt(eye, _target, glm::vec3(0.f, 1.f, 0.f));
}


glm::mat4 Camera::getProjection(float aspect) const
{
    return glm::perspective(glm::radians(45.f), aspect, 0.1f, 500.f);
}


void Camera::clampPitch()
{
    if (_pitch < PITCH_MIN) { _pitch = PITCH_MIN; _velPitch = 0.f; }
    if (_pitch > PITCH_MAX) { _pitch = PITCH_MAX; _velPitch = 0.f; }
}

void Camera::clampDist()
{
    if (_dist < DIST_MIN) { _dist = DIST_MIN; _velZoom = 0.f; }
    if (_dist > DIST_MAX) { _dist = DIST_MAX; _velZoom = 0.f; }
}
