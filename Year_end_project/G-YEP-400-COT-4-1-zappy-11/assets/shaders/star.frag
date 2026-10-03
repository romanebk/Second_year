#version 330 core

in float Brightness;

out vec4 FragColor;

void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float dist = length(d) * 2.0;

    float alpha = pow(max(0.0, 1.0 - dist), 2.2) * Brightness;
    if (alpha < 0.02) discard;

    vec3 color = vec3(0.92, 0.95, 1.0) * Brightness;
    FragColor = vec4(color, alpha);
}
