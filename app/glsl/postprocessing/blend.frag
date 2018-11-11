precision lowp float;

uniform sampler2D source;
uniform sampler2D passed;

varying vec2 vUv;

void main() {
  vec4 source_color = texture2D(source, vec2(vUv.x, vUv.y));
  vec4 passed_color = texture2D(passed, vec2(vUv.x, vUv.y));

  // gl_FragColor = vec4(
  //   passed_color.rgb*passed_color.a + source_color.rgb*(1. - passed_color.a),
  //   source_color.a+passed_color.a
  // );

  float blend = (passed_color.r + passed_color.g + passed_color.b)/3.;
  // float blend = passed_color.a;
  // float blend = 0.;

  gl_FragColor = vec4(vec3(1., 1., 1.)*blend + source_color.rgb*(1. - blend), 1.);
}
