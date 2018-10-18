precision highp float;
uniform sampler2D u_map;

varying vec2 vUv;
void main() {
  vec4 color = texture2D(u_map, vec2( vUv.x, 1. - vUv.y ));
  float alpha = 1.;
  if( color.x == 0. ){
    color.a = 0.;
  } else {
    color.rgb = vec3(.7, .7, .7);
  }
  gl_FragColor = color;
}
