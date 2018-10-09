precision highp float;

#define M_PI 3.1415926535897932384626433832795

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

//'blueprint' attribute
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform float u_time;
uniform sampler2D img_noise;
uniform sampler2D img_displacementmap;

uniform float u_noise_translation_intensity;
uniform float u_noise_translation_speed;
uniform float u_noise_translation_spread;
uniform float u_noise_rotation_intensity;
uniform float u_noise_rotation_speed;
uniform float u_noise_rotation_spread;
uniform float u_noise_bending_intensity;
uniform float u_noise_bending_speed;
uniform float u_noise_bending_spread;
uniform vec3 u_camera_position;
uniform vec3 u_based_position;


//instance attributes
attribute vec3 translation;
attribute vec4 rotation;
attribute vec2 coords;
attribute float rank;
attribute float offset;

varying vec2 vCoords;
varying vec2 vUv;
varying vec3 vNormal;

vec3 transform( inout vec3 P, vec3 T, vec4 R ) {
  //computes the rotation where R is a (vec4) quaternion
  P = 2.0 * cross( R.xyz, cross( R.xyz, P ) + R.w * P );

  //translates the transformed 'blueprint'
  P += T;

  //return the transformed position
  return P;
}

vec3 noise(float x, float y) {
  return texture2D(img_noise, vec2(mod(x, 1.), mod(y, 1.))).xyz;
}

void main() {

  vec3 pos = position;
  float spreading = sin(abs(offset/19.)*M_PI);
  vec3 trans = translation * spreading;
  // vec3 trans = vec3(0., 0., 0.);

  vec4 displacementmap = texture2D(img_displacementmap, uv);
  pos.z += displacementmap.x * cos(u_time*u_noise_bending_speed + rank/340.*u_noise_bending_spread) * u_noise_bending_intensity;

  vec3 curveNoise = noise((u_time*5. + offset/10.), 0.)*300. - 150.;

  vec3 translationNoise = noise(
    rank/340.*u_noise_translation_spread,
    u_time*u_noise_translation_speed
  )*u_noise_translation_intensity - u_noise_translation_intensity/2.;

  //vec3 translationNoise = vec3(0., 0., 0.);

  trans += translationNoise + curveNoise;

  vec3 rotationNoise = noise(
    rank/340.*u_noise_rotation_spread,
    u_time*u_noise_rotation_speed
  )*u_noise_rotation_intensity - u_noise_rotation_intensity/2.;

  vec4 newRotation = rotation;
  newRotation.x = cos(rotationNoise.x)*M_PI;
  newRotation.y = cos(rotationNoise.y)*M_PI;
  newRotation.z = cos(rotationNoise.z)*M_PI;
  newRotation.xyz = normalize(newRotation.xyz);

  transform( pos, trans + u_based_position, newRotation );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos , 1.0);

  vCoords = coords;
  vUv = uv;
  vNormal = normal;
}
