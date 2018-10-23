attribute vec3 translation;
attribute vec4 rotation;
attribute vec3 scale;
attribute float offset;
attribute float speed;

uniform float u_time;
uniform float u_zcenter;
uniform float u_zmin;
uniform float u_zmax;

vec3 transform( inout vec3 position, vec3 T, vec4 R, vec3 S ) {
    position *= S;
    position += 2.0 * cross( R.xyz, cross( R.xyz, position ) + R.w * position );
    position += T;
    return position;
}

varying vec2 vUv;
varying float fogDepth;

void main() {
    vec3 pos = position;

    vec3 newTranslation = translation;
    vec3 newPosition = position;
    if( position.x != 0. ) {
      newPosition.y = cos(u_time*4. + offset)*1.5;
    }

    newPosition.z = mod(newPosition.z + u_time*speed, u_zmax - u_zmin);
    transform( newPosition, newTranslation, rotation, scale );
    vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    fogDepth = -mvPosition.z;
}
