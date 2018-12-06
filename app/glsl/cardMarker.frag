precision highp float;
uniform sampler2D img_recto;
uniform sampler2D img_verso;
uniform vec2 coords;
uniform float opacity;

varying vec2 vUv;
varying vec3 vNormal;
void main() {
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

 if(color.r > 0.9 && color.g < 0.1 && color.b < 0.1) {
  discard;
 }

  gl_FragColor = color;
}
