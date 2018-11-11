precision lowp float;

uniform sampler2D passed;

varying vec2 vUv;

void main() {
  gl_FragColor = vec4(vec3(1., 1., 1.) - texture2D(passed, vec2(vUv.x, vUv.y)).rgb, 1.);
}
