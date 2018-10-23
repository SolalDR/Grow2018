precision highp float;
uniform sampler2D u_map;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying float fogDepth;
varying vec2 vUv;
void main() {
  vec4 color = texture2D(u_map, vec2( vUv.x, 1. - vUv.y ));
  float alpha = 1.;
  if( color.x == 0. ){
    color.a = 0.;
  } else {
    color.rgb = vec3(0., 0., 0.);
  }
  gl_FragColor = color;
  float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
}
