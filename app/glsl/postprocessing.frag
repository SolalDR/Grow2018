precision lowp float;

struct PixelMatrix {
  vec4 _0x0;vec4 _1x0;vec4 _2x0;vec4 _3x0;vec4 _4x0;
  vec4 _0x1;vec4 _1x1;vec4 _2x1;vec4 _3x1;vec4 _4x1;
  vec4 _0x2;vec4 _1x2;vec4 _2x2;vec4 _3x2;vec4 _4x2;
  vec4 _0x3;vec4 _1x3;vec4 _2x3;vec4 _3x3;vec4 _4x3;
  vec4 _0x4;vec4 _1x4;vec4 _2x4;vec4 _3x4;vec4 _4x4;
};

struct ConvolutionMatrix {
  float _0x0;float _1x0;float _2x0;float _3x0;float _4x0;
  float _0x1;float _1x1;float _2x1;float _3x1;float _4x1;
  float _0x2;float _1x2;float _2x2;float _3x2;float _4x2;
  float _0x3;float _1x3;float _2x3;float _3x3;float _4x3;
  float _0x4;float _1x4;float _2x4;float _3x4;float _4x4;
};

uniform float time;
uniform vec2 size;
uniform float opacity;
uniform float threshold;
uniform float step;
uniform vec3 bloom_color;
uniform sampler2D screen;
uniform ConvolutionMatrix convolution_matrix;

varying vec2 vCoords;
varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

PixelMatrix pixels(sampler2D texture, float x, float y, float step) {
  float steps2 = 2.*step;

  return PixelMatrix(
    texture2D(screen, vec2(x - steps2, y - steps2)),
    texture2D(screen, vec2(x -   step, y - steps2)),
    texture2D(screen, vec2(x         , y - steps2)),
    texture2D(screen, vec2(x -   step, y - steps2)),
    texture2D(screen, vec2(x + steps2, y - steps2)),
    texture2D(screen, vec2(x - steps2, y -   step)),
    texture2D(screen, vec2(x -   step, y -   step)),
    texture2D(screen, vec2(x         , y -   step)),
    texture2D(screen, vec2(x -   step, y -   step)),
    texture2D(screen, vec2(x + steps2, y -   step)),
    texture2D(screen, vec2(x - steps2, y         )),
    texture2D(screen, vec2(x -   step, y         )),
    texture2D(screen, vec2(x         , y         )),
    texture2D(screen, vec2(x -   step, y         )),
    texture2D(screen, vec2(x + steps2, y         )),
    texture2D(screen, vec2(x - steps2, y +   step)),
    texture2D(screen, vec2(x -   step, y +   step)),
    texture2D(screen, vec2(x         , y +   step)),
    texture2D(screen, vec2(x -   step, y +   step)),
    texture2D(screen, vec2(x + steps2, y +   step)),
    texture2D(screen, vec2(x - steps2, y + steps2)),
    texture2D(screen, vec2(x -   step, y + steps2)),
    texture2D(screen, vec2(x         , y + steps2)),
    texture2D(screen, vec2(x -   step, y + steps2)),
    texture2D(screen, vec2(x + steps2, y + steps2))
  );
}

vec4 convolve(PixelMatrix p, ConvolutionMatrix m) {
  return (
    m._0x0*p._0x0 + m._1x0*p._1x0 + m._2x0*p._2x0 + m._3x0*p._3x0 + m._4x0*p._4x0 +
    m._0x1*p._0x1 + m._1x1*p._1x1 + m._2x1*p._2x1 + m._3x1*p._3x1 + m._4x1*p._4x1 +
    m._0x2*p._0x2 + m._1x2*p._1x2 + m._2x2*p._2x2 + m._3x2*p._3x2 + m._4x2*p._4x2 +
    m._0x3*p._0x3 + m._1x3*p._1x3 + m._2x3*p._2x3 + m._3x3*p._3x3 + m._4x3*p._4x3 +
    m._0x4*p._0x4 + m._1x4*p._1x4 + m._2x4*p._2x4 + m._3x4*p._3x4 + m._4x4*p._4x4
  );
}

// vec4 convolve2(
//   sampler2D texture,
//   float x,
//   float y,
//   float intensity1,
//   float opacity1,
//   float step1,
//   mat4 matrix1,
//   float intensity2,
//   float opacity2,
//   float step2,
//   mat4 matrix2
// ) {
//   return convolvePixels(intensity2, opacity2, PixelMatrix(
//     convolve(texture, x - step2, y - step2, intensity1, opacity1, step1, matrix1),
//     convolve(texture, x        , y - step2, intensity1, opacity1, step1, matrix1),
//     convolve(texture, x + step2, y - step2, intensity1, opacity1, step1, matrix1),
//     convolve(texture, x - step2, y        , intensity1, opacity1, step1, matrix1),
//     convolve(texture, x        , y        , intensity1, opacity1, step1, matrix1),
//     convolve(texture, x + step2, y        , intensity1, opacity1, step1, matrix1),
//     convolve(texture, x - step2, y + step2, intensity1, opacity1, step1, matrix1),
//     convolve(texture, x        , y + step2, intensity1, opacity1, step1, matrix1),
//     convolve(texture, x + step2, y + step2, intensity1, opacity1, step1, matrix1)
//   ), matrix2);
// }

vec4 bloom(sampler2D texture, float x, float y, float opacity, float threshold, float step) {
  PixelMatrix p = pixels(texture, x, y, step);
  vec4 source = vec4(p._2x2.r, p._2x2.g, p._2x2.b, p._2x2.a);

  if((p._0x0.r + p._0x0.g + p._0x0.b)/3. < threshold) p._0x0 = vec4(bloom_color, 0.);
  else p._0x0 = vec4(bloom_color, 1.);
  if((p._1x0.r + p._1x0.g + p._1x0.b)/3. < threshold) p._1x0 = vec4(bloom_color, 0.);
  else p._1x0 = vec4(bloom_color, 1.);
  if((p._2x0.r + p._2x0.g + p._2x0.b)/3. < threshold) p._2x0 = vec4(bloom_color, 0.);
  else p._2x0 = vec4(bloom_color, 1.);
  if((p._3x0.r + p._3x0.g + p._3x0.b)/3. < threshold) p._3x0 = vec4(bloom_color, 0.);
  else p._3x0 = vec4(bloom_color, 1.);
  if((p._4x0.r + p._4x0.g + p._4x0.b)/3. < threshold) p._4x0 = vec4(bloom_color, 0.);
  else p._4x0 = vec4(bloom_color, 1.);
  if((p._0x1.r + p._0x1.g + p._0x1.b)/3. < threshold) p._0x1 = vec4(bloom_color, 0.);
  else p._0x1 = vec4(bloom_color, 1.);
  if((p._1x1.r + p._1x1.g + p._1x1.b)/3. < threshold) p._1x1 = vec4(bloom_color, 0.);
  else p._1x1 = vec4(bloom_color, 1.);
  if((p._2x1.r + p._2x1.g + p._2x1.b)/3. < threshold) p._2x1 = vec4(bloom_color, 0.);
  else p._2x1 = vec4(bloom_color, 1.);
  if((p._3x1.r + p._3x1.g + p._3x1.b)/3. < threshold) p._3x1 = vec4(bloom_color, 0.);
  else p._3x1 = vec4(bloom_color, 1.);
  if((p._4x1.r + p._4x1.g + p._4x1.b)/3. < threshold) p._4x1 = vec4(bloom_color, 0.);
  else p._4x1 = vec4(bloom_color, 1.);
  if((p._0x2.r + p._0x2.g + p._0x2.b)/3. < threshold) p._0x2 = vec4(bloom_color, 0.);
  else p._0x2 = vec4(bloom_color, 1.);
  if((p._1x2.r + p._1x2.g + p._1x2.b)/3. < threshold) p._1x2 = vec4(bloom_color, 0.);
  else p._1x2 = vec4(bloom_color, 1.);
  if((p._2x2.r + p._2x2.g + p._2x2.b)/3. < threshold) p._2x2 = vec4(bloom_color, 0.);
  else p._2x2 = vec4(bloom_color, 1.);
  if((p._3x2.r + p._3x2.g + p._3x2.b)/3. < threshold) p._3x2 = vec4(bloom_color, 0.);
  else p._3x2 = vec4(bloom_color, 1.);
  if((p._4x2.r + p._4x2.g + p._4x2.b)/3. < threshold) p._4x2 = vec4(bloom_color, 0.);
  else p._4x2 = vec4(bloom_color, 1.);
  if((p._0x3.r + p._0x3.g + p._0x3.b)/3. < threshold) p._0x3 = vec4(bloom_color, 0.);
  else p._0x3 = vec4(bloom_color, 1.);
  if((p._1x3.r + p._1x3.g + p._1x3.b)/3. < threshold) p._1x3 = vec4(bloom_color, 0.);
  else p._1x3 = vec4(bloom_color, 1.);
  if((p._2x3.r + p._2x3.g + p._2x3.b)/3. < threshold) p._2x3 = vec4(bloom_color, 0.);
  else p._2x3 = vec4(bloom_color, 1.);
  if((p._3x3.r + p._3x3.g + p._3x3.b)/3. < threshold) p._3x3 = vec4(bloom_color, 0.);
  else p._3x3 = vec4(bloom_color, 1.);
  if((p._4x3.r + p._4x3.g + p._4x3.b)/3. < threshold) p._4x3 = vec4(bloom_color, 0.);
  else p._4x3 = vec4(bloom_color, 1.);
  if((p._0x4.r + p._0x4.g + p._0x4.b)/3. < threshold) p._0x4 = vec4(bloom_color, 0.);
  else p._0x4 = vec4(bloom_color, 1.);
  if((p._1x4.r + p._1x4.g + p._1x4.b)/3. < threshold) p._1x4 = vec4(bloom_color, 0.);
  else p._1x4 = vec4(bloom_color, 1.);
  if((p._2x4.r + p._2x4.g + p._2x4.b)/3. < threshold) p._2x4 = vec4(bloom_color, 0.);
  else p._2x4 = vec4(bloom_color, 1.);
  if((p._3x4.r + p._3x4.g + p._3x4.b)/3. < threshold) p._3x4 = vec4(bloom_color, 0.);
  else p._3x4 = vec4(bloom_color, 1.);
  if((p._4x4.r + p._4x4.g + p._4x4.b)/3. < threshold) p._4x4 = vec4(bloom_color, 0.);
  else p._4x4 = vec4(bloom_color, 1.);

  vec4 color = convolve(p, convolution_matrix);

  float f = opacity*color.a;

  return vec4(color.rgb*f + source.rgb*(1. - f), 1.);
}

void main() {
  gl_FragColor = bloom(screen, vUv.x, vUv.y, opacity, threshold, step);

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

  // gl_FragColor = random((vUv.xy + time)/2.)*.2 + convolve2(screen, vUv.x, vUv.y,
  //   .2, .0, 0.001,
  //   mat3(
  //      0., -1.,  0.,
  //     -1.,  5., -1.,
  //      0., -1.,  0.
  //   ),
  //   .2, .0, 0.005,
  //   mat3(
  //      0., -1.,  0.,
  //     -1.,  5., -1.,
  //      0., -1.,  0.
  //   )
  // );
}
