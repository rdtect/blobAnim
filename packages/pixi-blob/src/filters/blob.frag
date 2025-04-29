precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uColors[8];
uniform vec3 uPoints[8];
uniform float uGooey;

const float PI = 3.14159265359;

float smoothMin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec4 color = vec4(0.0);
  float dist = 1000.0;
  
  for(int i = 0; i < 8; i++) {
    if(i >= int(uPoints[0].z)) break;
    
    vec2 point = uPoints[i].xy;
    float radius = uPoints[i].z;
    vec4 blobColor = uColors[i];
    
    float d = length(uv - point) - radius;
    dist = smoothMin(dist, d, uGooey);
    
    if(d < 0.0) {
      float alpha = smoothstep(0.0, 1.0, 1.0 - d / radius);
      color = mix(color, blobColor, alpha);
    }
  }
  
  gl_FragColor = color;
} 