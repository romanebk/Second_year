#version 330 core

layout(location = 0) in vec3  aPos;
layout(location = 1) in float aSize;
layout(location = 2) in float aBrightness;
layout(location = 3) in float aPhase;

uniform mat4  view;
uniform mat4  projection;
uniform float time;

out float Brightness;

void main() {
    gl_Position = projection * view * vec4(aPos, 1.0);

    float twinkle = 0.65 + 0.35 * sin(time * 1.7 + aPhase)
                         * 0.5 + 0.5 * sin(time * 0.9 + aPhase * 1.3);

    gl_PointSize = aSize * (0.8 + 0.2 * twinkle);
    Brightness   = aBrightness * twinkle;
}
