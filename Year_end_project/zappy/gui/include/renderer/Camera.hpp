#pragma once

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <SFML/Window/Event.hpp>




















class Camera {
public:
    Camera();
    void resetKeys();
    
    void setTarget(float cx, float cz);

    
    bool handleEvent(const sf::Event &event);

    
    
    void update(float dt);

    
    glm::mat4 getView()                    const;
    glm::mat4 getProjection(float aspect)  const;

    
    float getYaw()   const { return _yaw;   }
    float getPitch() const { return _pitch; }
    float getDist()  const { return _dist;  }
    glm::vec3 _center  { 0.f, 0.f, 0.f };
    
    glm::vec3 getEye() const {
        float radYaw   = glm::radians(_yaw);
        float radPitch = glm::radians(_pitch);
        return glm::vec3(
            _target.x + _dist * cosf(radPitch) * sinf(radYaw),
            _target.y + _dist * sinf(radPitch),
            _target.z + _dist * cosf(radPitch) * cosf(radYaw)
        );
    }

private:
    void clampPitch();
    void clampDist();

    
    glm::vec3 _target  { 0.f, 0.f, 0.f };
    float _yaw   = 45.f;      
    float _pitch = 35.264f;   
    float _dist  = 20.f;      

    
    float _velYaw   = 0.f;   
    float _velPitch = 0.f;   
    float _velZoom  = 0.f;   

    
    bool         _leftDrag  = false;
    bool         _rightDrag = false;
    sf::Vector2i _lastMouse { 0, 0 };

    
    bool _keyLeft  = false;
    bool _keyRight = false;
    bool _keyUp    = false;
    bool _keyDown  = false;
    bool _keyZoomIn  = false;
    bool _keyZoomOut = false;

    
    
    static constexpr float ROT_SPEED      = 0.35f;    
    static constexpr float PAN_SPEED      = 0.015f;
    static constexpr float SCROLL_ZOOM    = 0.12f;    

    
    static constexpr float KEY_ROT_ACCEL  = 120.f;    
    static constexpr float KEY_ZOOM_ACCEL = 1.5f;     

    
    static constexpr float DAMPING        = 8.f;      

    
    static constexpr float PITCH_MIN  = 5.f;
    static constexpr float PITCH_MAX  = 89.f;
    static constexpr float DIST_MIN   = 2.f;
    static constexpr float DIST_MAX   = 120.f;
};
