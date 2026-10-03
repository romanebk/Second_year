#version 330 core

in vec3 Normal;
in vec3 FragPos;
in vec2 TexCoord;

uniform sampler2D planetTexture;

out vec4 FragColor;

void main() {
    vec3  lightDir = normalize(vec3(0.4, 0.6, 0.5));
    vec3  norm     = normalize(Normal);
    float diff     = max(dot(norm, lightDir), 0.0);
    float ambient  = 0.35;
    float light    = ambient + diff * 0.7;

    vec3 texColor = texture(planetTexture, TexCoord).rgb;
    FragColor = vec4(texColor * light, 1.0);
}
