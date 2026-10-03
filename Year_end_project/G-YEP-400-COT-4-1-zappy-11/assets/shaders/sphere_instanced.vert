#version 330 core

layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;

layout(location = 2) in vec4 aModelCol0;
layout(location = 3) in vec4 aModelCol1;
layout(location = 4) in vec4 aModelCol2;
layout(location = 5) in vec4 aModelCol3;
layout(location = 6) in vec3 aColor;

uniform mat4 view;
uniform mat4 projection;

out vec3 Normal;
out vec3 FragPos;
out vec3 InstanceColor;

void main() {
    mat4 model = mat4(aModelCol0, aModelCol1, aModelCol2, aModelCol3);

    vec4 worldPos = model * vec4(aPos, 1.0);
    gl_Position   = projection * view * worldPos;
    FragPos = vec3(worldPos);
    Normal  = mat3(transpose(inverse(model))) * aNormal;
    InstanceColor = aColor;
}
