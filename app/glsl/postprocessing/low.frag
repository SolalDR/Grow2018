precision lowp float;

uniform sampler2D passed;
uniform float threshold;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(passed, vec2(vUv.x, vUv.y));
  gl_FragColor = vec4(color.rgb, (color.r + color.g + color.b)/3. <= threshold ? color.a : 0.);
}
