precision lowp float;

uniform sampler2D passed;

varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(passed, vec2(vUv.x, vUv.y));
}
