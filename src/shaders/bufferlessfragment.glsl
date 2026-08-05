#version 300 es

out vec4 pos;
void main(){
    gl_Position = vec4(-1.0 + pow(float(gl_VertexID),2.0)*(1.0/2500.0),-1.0 + (1.0/50.0)*float(gl_VertexID),0,1);
    pos = (gl_Position + vec4(2,1,0,0)/2.0);
    gl_PointSize = 5.0;
}