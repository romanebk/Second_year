#version 330 core

in vec3 Normal;
in vec3 FragPos;
in vec3 InstanceColor;

out vec4 FragColor;

void main() {
    vec3  lightDir = normalize(vec3(0.4, 1.0, 0.5));
    vec3  norm     = normalize(Normal);
    float diff     = max(dot(norm, lightDir), 0.0);
    float ambient  = 0.55;
    float light    = ambient + diff * 0.55;

    float fresnel = pow(1.0 - abs(dot(norm, vec3(0.0, 0.0, 1.0))), 2.0);
    light += fresnel * 0.3;

    FragColor = vec4(InstanceColor * light, 1.0);
}
