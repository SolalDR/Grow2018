varying vec3 vPos;
varying vec2 vUv;
varying vec3 vNormal;
void main() {
    vec3 pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    vPos = pos;
    vUv = uv;
    vNormal = normal;
}
