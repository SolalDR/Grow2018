precision lowp float;

uniform float time;
uniform vec2 size;
uniform sampler2D screen;

varying vec2 vCoords;
varying vec2 vUv;

// struct convolutionPixels {
//   float _00;float _10;float _20;
//   float _01;float _11;float _21;
//   float _02;float _12;float _22;
// };

struct Vec4Matrix {
  vec4 _00;vec4 _10;vec4 _20;
  vec4 _01;vec4 _11;vec4 _21;
  vec4 _02;vec4 _12;vec4 _22;
};

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

vec4 convolvePixels(
  float intensity,
  float opacity,
  Vec4Matrix pixels,
  mat3 matrix
) {
  vec4 color = vec4((
    matrix[0][0]*pixels._00.xyz + matrix[1][0]*pixels._10.xyz + matrix[2][0]*pixels._20.xyz +
    matrix[0][1]*pixels._01.xyz + matrix[1][1]*pixels._11.xyz + matrix[2][1]*pixels._21.xyz +
    matrix[0][2]*pixels._02.xyz + matrix[1][2]*pixels._12.xyz + matrix[2][2]*pixels._22.xyz
  ), 1.);

  float f = intensity;//*((color.x + color.y + color.z)/3. - opacity);

  return color*f + vec4(pixels._11.xyz*(1. - f), 1.);
}

vec4 convolve(
  sampler2D texture,
  float x,
  float y,
  float intensity,
  float opacity,
  float step,
  mat3 matrix
) {
  return convolvePixels(intensity, opacity, Vec4Matrix(
    texture2D(screen, vec2(x - step, y - step)),
    texture2D(screen, vec2(x       , y - step)),
    texture2D(screen, vec2(x + step, y - step)),
    texture2D(screen, vec2(x - step, y       )),
    texture2D(screen, vec2(x       , y       )),
    texture2D(screen, vec2(x + step, y       )),
    texture2D(screen, vec2(x - step, y + step)),
    texture2D(screen, vec2(x       , y + step)),
    texture2D(screen, vec2(x + step, y + step))
  ), matrix);
}

vec4 convolve2(
  sampler2D texture,
  float x,
  float y,
  float intensity1,
  float opacity1,
  float step1,
  mat3 matrix1,
  float intensity2,
  float opacity2,
  float step2,
  mat3 matrix2
) {
  return convolvePixels(intensity2, opacity2, Vec4Matrix(
    convolve(texture, x - step2, y - step2, intensity1, opacity1, step1, matrix1),
    convolve(texture, x        , y - step2, intensity1, opacity1, step1, matrix1),
    convolve(texture, x + step2, y - step2, intensity1, opacity1, step1, matrix1),
    convolve(texture, x - step2, y        , intensity1, opacity1, step1, matrix1),
    convolve(texture, x        , y        , intensity1, opacity1, step1, matrix1),
    convolve(texture, x + step2, y        , intensity1, opacity1, step1, matrix1),
    convolve(texture, x - step2, y + step2, intensity1, opacity1, step1, matrix1),
    convolve(texture, x        , y + step2, intensity1, opacity1, step1, matrix1),
    convolve(texture, x + step2, y + step2, intensity1, opacity1, step1, matrix1)
  ), matrix2);
}

void main() {
  // 1./9., 1./9., 1./9.,
  // 1./9., 1./9., 1./9.,
  // 1./9., 1./9., 1./9.
  // -1., -1., -1.,
  // -1.,  8., -1.,
  // -1., -1., -1.
  // -2., -1.,  0.,
  // -1.,  1.,  1.,
  //  1.,  1.,  2.,
  // mat3(
  //   1./9., 1./9., 1./9.,
  //   1./9., 1./9., 1./9.,
  //   1./9., 1./9., 1./9.
  // ),

  gl_FragColor = random((vUv.xy + time)/2.)*.2 + convolve2(screen, vUv.x, vUv.y,
    .2, .0, 0.001,
    mat3(
       0., -1.,  0.,
      -1.,  5., -1.,
       0., -1.,  0.
    ),
    .2, .0, 0.005,
    mat3(
       0., -1.,  0.,
      -1.,  5., -1.,
       0., -1.,  0.
    )
  );
}
