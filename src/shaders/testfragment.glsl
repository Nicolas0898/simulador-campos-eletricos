#version 300 es

precision highp float;
out vec4 COLOR;
in vec4 pos;


#define MAXCHARGES 10
uniform vec3 charges[MAXCHARGES];
uniform int charge_count;
uniform vec2 resolution;

const float K = 9e+10;

void main(){
    vec2 truePos = pos.xy*resolution;
    float final_E = 0.0;

    for(int i=0;i<charge_count;i++){
        vec2 delta = abs(truePos-charges[i].xy);
        float r = dot(delta,delta); 



        final_E += K * (charges[i].z/pow(r,2.0));
    }

    float normalized=log(1.0+abs(final_E))/log(1.0+10000000.0) * ((final_E>0.0) ? 1.0:-1.0);
    
    float n2 = 0.5+normalized;
    COLOR = vec4(1.0-n2,n2,n2,1);
}