uniform sampler2D u_map;
uniform sampler2D u_ao;
uniform bool u_hasmaptexture;
uniform vec3 u_emissive;
uniform vec3 u_color;

varying vec2 vUv;
varying vec4 outputColor;

void main()
{
  // vec3 color = outputColor.xyz;

  vec3 map = texture2D(u_map, vUv).xyz;
  vec3 color = outputColor.xyz;

  if( map.x > 0.5 ){
    color = vec3(0., 0., 1.);
  } else if( map.y > 0.5 ) {
    color = vec3(0., 1., 0.);
  }
  vec3 shadow = texture2D(u_ao, vUv).xyz;

  gl_FragColor = vec4(color, 1.);
}
