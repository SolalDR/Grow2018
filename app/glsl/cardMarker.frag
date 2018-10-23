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
  		vUv.x/8. + coords.x/8.,
  		vUv.y/8. + coords.y/8.
  	));
    //color = vec4(vNormal.z, 0.0, 0.0, 1.0);
  } else {
  	color = texture2D(img_verso, vec2(
  		vUv.x/8. + coords.x/8.,
  		vUv.y/8. + coords.y/8.
  	));
    //color = vec4(vNormal.z, 0.0, 0.0, 1.0);
 }
 color.w = opacity;
  gl_FragColor = color;
}
