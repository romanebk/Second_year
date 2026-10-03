#version 330 core

in vec3 Normal;
in vec3 FragPos;

uniform vec3 glowColor;

out vec4 FragColor;

void main() {
    // Éclairage Lambertien + forte composante ambiante pour l'effet lumineux
    vec3  lightDir = normalize(vec3(0.4, 1.0, 0.5));
    vec3  norm     = normalize(Normal);
    float diff     = max(dot(norm, lightDir), 0.0);
    float ambient  = 0.55;
    float light    = ambient + diff * 0.55;

    // Fresnel léger — bords plus lumineux pour l'aspect "bol lumineux"
    // viewDir approximé depuis la normale du vertex (sphère centrée en 0)
    float fresnel = pow(1.0 - abs(dot(norm, vec3(0.0, 0.0, 1.0))), 2.0);
    light += fresnel * 0.3;

    FragColor = vec4(glowColor * light, 1.0);
}
