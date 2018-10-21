attribute vec3 translation;
attribute vec4 rotation;
attribute vec3 scale;
attribute vec3 color;


vec3 transform( inout vec3 position, vec3 T, vec4 R, vec3 S ) {
  position *= S;
  position += 2.0 * cross( R.xyz, cross( R.xyz, position ) + R.w * position );
  position += T;
  return position;
}

varying vec2 vUv;
varying vec3 vColor;

void main() {
  vec3 newPosition = position;
  vUv = uv;
  vColor = color;
  transform( newPosition, translation, rotation, scale );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
