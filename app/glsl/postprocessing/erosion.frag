precision lowp float;

uniform sampler2D passed;
uniform sampler2D depth;
uniform vec2 step;
uniform float intensity;

varying vec2 vUv;

void main() {
  float i = intensity;

  vec4 color = texture2D(passed, vUv.xy);

  if(color.a != 0.) {
    vec4 other_color = (
      texture2D(passed, vec2(vUv.x - step.x*i, vUv.y - step.y*i)) +
      texture2D(passed, vec2(vUv.x, vUv.y - step.y*i)) +
      texture2D(passed, vec2(vUv.x + step.x*i, vUv.y - step.y*i)) +
      texture2D(passed, vec2(vUv.x + step.x*i, vUv.y)) +
      texture2D(passed, vec2(vUv.x + step.x*i, vUv.y + step.y*i)) +
      texture2D(passed, vec2(vUv.x, vUv.y + step.y*i)) +
      texture2D(passed, vec2(vUv.x - step.x*i, vUv.y + step.y*i)) +
      texture2D(passed, vec2(vUv.x - step.x*i, vUv.y))
    )/4.;

    if(other_color.a != 1.) color.a = 0.;
  }

  gl_FragColor = color;
}
