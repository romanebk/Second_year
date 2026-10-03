#version 330 core

// Le quad billboard est déjà en espace monde via la model matrix
// aPos = coordonnées locales [-1,1]
layout(location = 0) in vec2 aPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 TexCoord;   // [-1,1] — utilisé pour calculer la distance au centre

void main() {
    gl_Position = projection * view * model * vec4(aPos, 0.0, 1.0);
    TexCoord = aPos;
}
