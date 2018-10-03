precision lowp float;

varying vec2 vCoords;

void main() {
  gl_FragColor = vec4(
    vCoords.x/19.,
    vCoords.y/19.,
    0.,
    1.
  );
}
