#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
out vec4 pos;
 
// all shaders have a main function
void main() {
 
  gl_Position = vec4(a_position.xy,0,1);
  pos = vec4((a_position.x + 1.0)/2.0,1.0-(a_position.y + 1.0)/2.0,0,1);
  gl_PointSize = 1.0;
}