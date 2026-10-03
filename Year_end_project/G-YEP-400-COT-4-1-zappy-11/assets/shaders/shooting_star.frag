#version 330 core

in float Alpha;

out vec4 FragColor;

void main() {
    if (Alpha < 0.01) discard;

    FragColor = vec4(vec3(0.95, 0.97, 1.0) * Alpha, Alpha);
}
