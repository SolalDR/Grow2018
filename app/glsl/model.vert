uniform float u_time;
uniform sampler2D img_noise;

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

vec3 transform( inout vec3 newPosition, vec3 T, vec4 R, vec3 S ) {
  //applies the scale
  newPosition *= S;
  //computes the rotation where R is a (vec4) quaternion
  newPosition += 2.0 * cross( R.xyz, cross( R.xyz, newPosition ) + R.w * newPosition );
  //translates the transformed 'blueprint'
  newPosition += T;
  //return the transformed position
  return newPosition;
}


void main() {

  vec3 pos = position;

  vec4 noiseTranslation = texture2D(img_noise, 
    vec2( rank/340.*u_noise_translation_spread, mod(u_time*u_noise_translation_speed, 1.))
  )*u_noise_translation_intensity - u_noise_translation_intensity/2.;
  pos += noiseTranslation.xyz;

  vec4 noiseRotation = texture2D(img_noise, 
    vec2(rank/340.*u_noise_rotation_spread, mod(u_time*u_noise_rotation_speed, 1.))
  )*u_noise_rotation_intensity - u_noise_rotation_intensity/2.;

  vec4 newRotation = rotation;
  newRotation.x = cos(noiseRotation.x);
  newRotation.y = cos(noiseRotation.y);
  newRotation.z = cos(noiseRotation.z);


  transform( pos, translation, newRotation, scale );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos , 1.0);

  vPos = position;
  vCoords = coords;
  vUv = uv;
  vNormal = normal;
}