precision highp float;
uniform sampler2D u_map;

varying vec2 vUv;
varying vec3 vColor;
void main() {

  vec4 specular = texture2D(u_map, vUv);
  vec4 color = vec4(0., 0., 0., 1.);

  if( specular.x < 0.1 ){
    color.a = 0.;
  }

  gl_FragColor = color;
}
