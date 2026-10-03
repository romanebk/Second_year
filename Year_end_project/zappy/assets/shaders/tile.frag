#version 330 core

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoord;

uniform sampler2D floorTexture;
uniform float     highlight;

out vec4 FragColor;

void main() {
    
    vec3  lightDir = normalize(vec3(0.4, 1.0, 0.5));
    vec3  norm     = normalize(Normal);
    float diff     = max(dot(norm, lightDir), 0.0);
    float ambient  = 0.35;
    float light    = ambient + diff * 0.65;

    
    vec3 texColor = texture(floorTexture, TexCoord).rgb;

    vec3 color = texColor * light;
    color = mix(color, vec3(1.0), highlight * 0.3);

    FragColor = vec4(color, 1.0);
}
