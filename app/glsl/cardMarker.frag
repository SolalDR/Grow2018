precision highp float;
uniform sampler2D img_recto;
uniform sampler2D img_verso;
uniform vec2 coords;
uniform float opacity;

varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vec4 transparentColor = vec4(1.,0.,0., 1.);
  float treshold = 0.4;
  vec4 color;
  if( vNormal.z < 0. ) {
  	color = texture2D(img_recto, vec2(
  		(1. - vUv.x)/8. + coords.x/8.,
  		-vUv.y/8. + (1. - coords.y/8.)
  	));
    //color = vec4(vNormal.z, 0.0, 0.0, 1.0);
  } else {
  	color = texture2D(img_verso, vec2(
  		(1. - vUv.x)/8. + coords.x/8.,
  		-vUv.y/8. + (1. - coords.y/8.)
  	));
    //color = vec4(vNormal.z, 0.0, 0.0, 1.0);
 }
 color.a = opacity;

 vec3 transparent_diff = color.xyz - transparentColor.xyz;
 float transparent_diff_squared = dot(transparent_diff,transparent_diff);

 vec2 centeredUv = vUv - vec2(0.5);
 if(transparent_diff_squared < treshold && (abs(centeredUv.x) > 0.4 || abs(centeredUv.y) > 0.4) ) {
  discard;
 }

  gl_FragColor = color;
}
