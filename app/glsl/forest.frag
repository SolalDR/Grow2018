uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

precision highp float;
uniform sampler2D u_map;

varying float fogDepth;
varying vec2 vUv;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor;


  float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
}
