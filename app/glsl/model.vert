uniform float u_time;
uniform sampler2D img_noise;
uniform sampler2D img_bumpmap;

uniform float u_noise_translation_intensity;
uniform float u_noise_translation_speed;
uniform float u_noise_translation_spread;
uniform float u_noise_rotation_intensity;
uniform float u_noise_rotation_speed;
uniform float u_noise_rotation_spread;


//instance attributes
attribute vec3 translation;
attribute vec4 rotation;
attribute vec3 scale;
attribute vec2 coords;
attribute float rank;

varying vec3 vPos;
varying vec2 vCoords;
varying vec2 vUv;
varying vec3 vNormal;

vec3 transform( inout vec3 P, vec3 T, vec4 R, vec3 S ) {
  //computes the rotation where R is a (vec4) quaternion
  // P += 2.0 * cross( R.xyz, cross( R.xyz, P ) + R.w * P );
  P = 2.0 * cross( R.xyz, cross( R.xyz, P ) + R.w * P );
  //translates the transformed 'blueprint'
  P += T;
  //return the transformed position
  return P;
}


void main() {

  vec3 pos = position;
  vec3 trans = translation;

  vec4 bumpmap = texture2D(img_bumpmap, uv);
  pos.z += bumpmap.x * cos(u_time*1000. + rank) * 20.;

  vec4 noiseTranslation = texture2D(img_noise, 
    vec2( rank/340.*u_noise_translation_spread, mod(u_time*u_noise_translation_speed, 1.))
  )*u_noise_translation_intensity - u_noise_translation_intensity/2.;
  trans += noiseTranslation.xyz;

  vec4 noiseRotation = texture2D(img_noise, 
    vec2(rank/340.*u_noise_rotation_spread, mod(u_time*u_noise_rotation_speed, 1.))
  )*u_noise_rotation_intensity - u_noise_rotation_intensity/2.;

  vec4 newRotation = rotation;
  newRotation.x = cos(noiseRotation.x);
  newRotation.y = cos(noiseRotation.y);
  newRotation.z = cos(noiseRotation.z);
  newRotation.xyz = normalize(newRotation.xyz);

  transform( pos, trans, newRotation, scale );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos , 1.0);

  vPos = position;
  vCoords = coords;
  vUv = uv;
  vNormal = normal;
}