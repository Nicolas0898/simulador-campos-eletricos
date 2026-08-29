#version 300 es
precision highp float;

out vec4 outColor;
uniform sampler2D point_data;
uniform sampler2D heatmap;
uniform int point_n;
uniform vec2 resolution;
uniform int type;
uniform float scale;
const float K = 9e+10;
const float E = 2.718282f;

vec4 get_field(){
    vec2 final_E = vec2(0,0);
    float elpontential = 0.0;

    for(int i=0;i<point_n;i++){
        vec4 data = texelFetch(point_data,ivec2(0,i),0);
        vec2 cord = (vec2(0,resolution.y) - gl_FragCoord.xy)*vec2(-1,1);
        vec2 delta = (cord-data.xy);
        float r = dot(delta,delta); 

        final_E += delta * K * (data.z/pow(r*scale,2.0));
        elpontential += K * (data.z/(r*scale));
    }

    return vec4(final_E,dot(final_E,final_E),elpontential);
}

void main(){
    vec2 uv = gl_FragCoord.xy/resolution*vec2(1,-1);
    vec4 colorsample = texture(point_data, uv);
    vec4 field = get_field();
    
    // vec4 data = texelFetch(point_data,ivec2(0,4),0);
    // outColor = vec4(data.xyz/1000.0,1.0);
    // outColor = vec4(1,1,1,1);
    if(type==0){
        vec4 upcolor = vec4(0.5, 1.0, 0.5,1);
        vec4 leftcolor = vec4(0.0, 0.5, 0.5,1);
        vec4 downcolor = vec4(0.5, 0.0, 0.5,1);
        vec4 rightcolor = vec4(1.0, 0.5, 0.5,1);
        float modu = dot(field.xyz,field.xyz);
        // float factor = field.z>0.0?1.0:-1.0;

        float updot = dot(normalize(field.xy),vec2(0.0,-1.0));
        updot = updot>0.0?updot:0.0;
        vec4 finalColor  = upcolor*updot;

        float downdot = dot(normalize(field.xy),vec2(0.0,1.0));
        downdot = downdot>0.0?downdot:0.0;
        finalColor  += downcolor*downdot;
        
        float rightdot = dot(normalize(field.xy),vec2(1.0,0));
        rightdot = rightdot>0.0?rightdot:0.0;
        finalColor  += rightcolor*rightdot;

        float leftdot = dot(normalize(field.xy),vec2(-1.0,0));
        leftdot = leftdot>0.0?leftdot:0.0;
        finalColor  += leftcolor*leftdot;


        outColor += vec4(finalColor.xyz,clamp((log(modu)/log(1e+10)),0.01,1.0) ) ;
    }
    else if(type==1){
        // float normalized_field = (abs(field.z) + 1.1)/10e+5;
        float sigma = 1.0/(1.0+exp(-log(field.z)/36.0));
        // outColor = vec4(sigma,sigma,sigma,abs(sigma)) *vec4(0,0,0,1);
        // vec4 f=vec4(1,0,0,1);        
        // vec4 s=vec4(0,1,0,1);        
        // vec4 t=vec4(0,0,1,1); 
        outColor = texture(heatmap,vec2(1.0-sigma,0.0));
    }
    else if(type==2){
        float normalized_field = (max(log(abs(field.w)/7e+3)/7.0,0.0)) * (field.w>0.0?1.0:-1.0) ;
        outColor = vec4(-normalized_field,0.0,normalized_field,abs(normalized_field));
    }
    // outColor = vec4(texture(heatmap,uv).rgb,1.0);
}