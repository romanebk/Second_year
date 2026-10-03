#version 330 core

in vec3 FragPos;
in vec3 Normal;

uniform vec3 teamColor;
uniform vec3 viewPos;
uniform float playerLevel;

out vec4 FragColor;

void main() {
    vec3 norm    = normalize(Normal);
    vec3 viewDir = normalize(viewPos - FragPos);

    vec3  lightDir = normalize(vec3(0.4, 1.0, 0.5));
    float diff     = max(dot(norm, lightDir), 0.0);
    vec3  color    = teamColor * (0.40 + diff * 0.70);

    float fres = pow(1.0 - max(dot(norm, viewDir), 0.0), 3.0);
    color += teamColor * fres * 0.45;

    color += teamColor * clamp(playerLevel * 0.04, 0.0, 0.35);

    FragColor = vec4(color, 1.0);
}
