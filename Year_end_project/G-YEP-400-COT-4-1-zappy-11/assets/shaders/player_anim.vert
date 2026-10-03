#version 330 core




layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;

uniform mat4  model;
uniform mat4  view;
uniform mat4  projection;
uniform float time;        
uniform float walkPhase;   
uniform float walkAmount;  

out vec3 FragPos;
out vec3 Normal;

void main() {
    vec3 pos    = aPos;
    vec3 normal = aNormal;

    
    float yN   = clamp(aPos.y, 0.0, 1.0);
    float side = sign(aPos.x);

    if (walkAmount > 0.001) {
        float swing = sin(walkPhase);

        
        
        float legFactor = clamp((0.5 - yN) * 2.0, 0.0, 1.0);
        float legSwing  = swing * side;

        
        
        float armFactor = clamp((yN - 0.5) * 2.0, 0.0, 1.0)
                        * smoothstep(0.08, 0.28, abs(aPos.x));
        float armSwing  = -swing * side;

        
        pos.z += (legFactor * legSwing * 0.18 + armFactor * armSwing * 0.26) * walkAmount;

        
        float footLift = max(0.0, cos(walkPhase) * side) * legFactor;
        pos.y += footLift * 0.06 * walkAmount;

        
        pos.x += clamp((yN - 0.6) * 2.5, 0.0, 1.0) * cos(walkPhase) * 0.03 * walkAmount;
    }

    
    float breathe = sin(time * 2.0 + aPos.y * 3.0) * 0.5 + 0.5;
    pos += normal * breathe * 0.004;

    vec4 worldPos = model * vec4(pos, 1.0);
    gl_Position   = projection * view * worldPos;

    FragPos = vec3(worldPos);
    Normal  = mat3(transpose(inverse(model))) * normal;
}
