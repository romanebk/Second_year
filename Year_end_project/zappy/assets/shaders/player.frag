#version 330 core

in vec3 FragPos;
in vec3 Normal;

uniform vec3 teamColor;
uniform float selected;
uniform float levelGlow;

out vec4 FragColor;

void main() {
    vec3  lightDir = normalize(vec3(0.4, 1.0, 0.5));
    vec3  norm     = normalize(Normal);
    float diff     = max(dot(norm, lightDir), 0.0);
    float ambient  = 0.30;
    float light    = ambient + diff * 0.70;

    vec3 color = teamColor * light;
    color += teamColor * levelGlow * 0.25;

    if (selected > 0.5) {
        color = mix(color, vec3(1.0, 0.95, 0.4), 0.35);
    }

    FragColor = vec4(color, 1.0);
}
