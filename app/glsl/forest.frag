precision highp float;
uniform sampler2D u_map;

varying vec2 vUv;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor;
}
