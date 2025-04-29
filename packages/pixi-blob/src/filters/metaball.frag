// Original metaball fragment shader
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 uColors[8];
uniform vec3 uPoints[8];
uniform float uGooey;
uniform float uCount;

const float PI = 3.14159265359;

float sphere(vec2 pos, vec2 center, float radius) {
    return length(pos - center) - radius;
}

float blobN(float distances[8], int count) {
    float k = 2.0;
    float sum = 0.0;
    for (int i = 0; i < 8; i++) {
        if (i >= count) break;
        sum += exp(-k * distances[i]);
    }
    return -log(sum) / k;
}

float scene(vec2 pos) {
    float distances[8];
    int count = int(min(uCount, 8.0));
    for (int i = 0; i < 8; i++) {
        if (i >= count) break;
        distances[i] = sphere(pos, uPoints[i].xy, uPoints[i].z);
    }
    return blobN(distances, count);
}

vec2 calcNormal(vec2 pos) {
    const float eps = 0.002;
    return normalize(vec2(
        scene(pos + vec2(eps, 0.0)) - scene(pos - vec2(eps, 0.0)),
        scene(pos + vec2(0.0, eps)) - scene(pos - vec2(0.0, eps))
    ));
}

vec3 calcLight(vec2 pos, vec2 normal, vec3 color) {
    vec2 lightPos = vec2(0.5, 0.5);
    vec2 lightDir = normalize(pos - lightPos);
    float diff = max(dot(normal, -lightDir), 0.0);
    float spec = pow(max(dot(reflect(lightDir, normal), vec2(0.0, -1.0)), 0.0), 32.0);
    return color * (0.5 + 0.5 * diff) + vec3(0.5) * spec;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 pos = uv * 2.0 - 1.0;
    float dist = scene(pos);
    vec3 color = vec3(0.0);
    if (dist < 0.0) {
        int closestBlobIndex = 0;
        float closestDist = 1000.0;
        int count = int(min(uCount, 8.0));
        for (int i = 0; i < 8; i++) {
            if (i >= count) break;
            float d = sphere(pos, uPoints[i].xy, uPoints[i].z);
            if (d < closestDist) {
                closestDist = d;
                closestBlobIndex = i;
            }
        }
        vec2 normal = calcNormal(pos);
        color = calcLight(pos, normal, uColors[closestBlobIndex].rgb);
        if (uGooey > 0.0) {
            color = mix(color, color * 1.2, smoothstep(-0.1, 0.0, dist));
        }
    }
    gl_FragColor = vec4(color, 1.0);
}