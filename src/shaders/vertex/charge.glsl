#version 300 es

uniform vec2 resolution;
in vec2 position;


void main(){
    vec2 clip_position = #clip(position,resolution);

    gl_Position = vec4(clip_position.xy,0,1);
    gl_PointSize = 5.0;
}