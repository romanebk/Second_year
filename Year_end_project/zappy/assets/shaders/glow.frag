#version 330 core

in vec2 TexCoord;

uniform vec3 glowColor;

out vec4 FragColor;

void main() {
    // Distance au centre du quad [0, √2]
    float dist = length(TexCoord);

    // Halo : fort au centre, nul aux bords
    // Exposant élevé → halo concentré et net
    float alpha = pow(max(0.0, 1.0 - dist), 2.5) * 0.75;

    if (alpha < 0.005) discard;

    FragColor = vec4(glowColor, alpha);
}
