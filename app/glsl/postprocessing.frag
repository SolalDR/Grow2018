precision lowp float;

struct PixelMatrix {
  vec4  _0x0;vec4  _1x0;vec4  _2x0;vec4  _3x0;vec4  _4x0;vec4  _5x0;vec4  _6x0;vec4  _7x0;vec4  _8x0;vec4  _9x0;vec4  _10x0;
  vec4  _0x1;vec4  _1x1;vec4  _2x1;vec4  _3x1;vec4  _4x1;vec4  _5x1;vec4  _6x1;vec4  _7x1;vec4  _8x1;vec4  _9x1;vec4  _10x1;
  vec4  _0x2;vec4  _1x2;vec4  _2x2;vec4  _3x2;vec4  _4x2;vec4  _5x2;vec4  _6x2;vec4  _7x2;vec4  _8x2;vec4  _9x2;vec4  _10x2;
  vec4  _0x3;vec4  _1x3;vec4  _2x3;vec4  _3x3;vec4  _4x3;vec4  _5x3;vec4  _6x3;vec4  _7x3;vec4  _8x3;vec4  _9x3;vec4  _10x3;
  vec4  _0x4;vec4  _1x4;vec4  _2x4;vec4  _3x4;vec4  _4x4;vec4  _5x4;vec4  _6x4;vec4  _7x4;vec4  _8x4;vec4  _9x4;vec4  _10x4;
  vec4  _0x5;vec4  _1x5;vec4  _2x5;vec4  _3x5;vec4  _4x5;vec4  _5x5;vec4  _6x5;vec4  _7x5;vec4  _8x5;vec4  _9x5;vec4  _10x5;
  vec4  _0x6;vec4  _1x6;vec4  _2x6;vec4  _3x6;vec4  _4x6;vec4  _5x6;vec4  _6x6;vec4  _7x6;vec4  _8x6;vec4  _9x6;vec4  _10x6;
  vec4  _0x7;vec4  _1x7;vec4  _2x7;vec4  _3x7;vec4  _4x7;vec4  _5x7;vec4  _6x7;vec4  _7x7;vec4  _8x7;vec4  _9x7;vec4  _10x7;
  vec4  _0x8;vec4  _1x8;vec4  _2x8;vec4  _3x8;vec4  _4x8;vec4  _5x8;vec4  _6x8;vec4  _7x8;vec4  _8x8;vec4  _9x8;vec4  _10x8;
  vec4  _0x9;vec4  _1x9;vec4  _2x9;vec4  _3x9;vec4  _4x9;vec4  _5x9;vec4  _6x9;vec4  _7x9;vec4  _8x9;vec4  _9x9;vec4  _10x9;
  vec4 _0x10;vec4 _1x10;vec4 _2x10;vec4 _3x10;vec4 _4x10;vec4 _5x10;vec4 _6x10;vec4 _7x10;vec4 _8x10;vec4 _9x10;vec4 _10x10;
};

struct ConvolutionMatrix {
  float  _0x0;float  _1x0;float  _2x0;float  _3x0;float  _4x0;float  _5x0;float  _6x0;float  _7x0;float  _8x0;float  _9x0;float  _10x0;
  float  _0x1;float  _1x1;float  _2x1;float  _3x1;float  _4x1;float  _5x1;float  _6x1;float  _7x1;float  _8x1;float  _9x1;float  _10x1;
  float  _0x2;float  _1x2;float  _2x2;float  _3x2;float  _4x2;float  _5x2;float  _6x2;float  _7x2;float  _8x2;float  _9x2;float  _10x2;
  float  _0x3;float  _1x3;float  _2x3;float  _3x3;float  _4x3;float  _5x3;float  _6x3;float  _7x3;float  _8x3;float  _9x3;float  _10x3;
  float  _0x4;float  _1x4;float  _2x4;float  _3x4;float  _4x4;float  _5x4;float  _6x4;float  _7x4;float  _8x4;float  _9x4;float  _10x4;
  float  _0x5;float  _1x5;float  _2x5;float  _3x5;float  _4x5;float  _5x5;float  _6x5;float  _7x5;float  _8x5;float  _9x5;float  _10x5;
  float  _0x6;float  _1x6;float  _2x6;float  _3x6;float  _4x6;float  _5x6;float  _6x6;float  _7x6;float  _8x6;float  _9x6;float  _10x6;
  float  _0x7;float  _1x7;float  _2x7;float  _3x7;float  _4x7;float  _5x7;float  _6x7;float  _7x7;float  _8x7;float  _9x7;float  _10x7;
  float  _0x8;float  _1x8;float  _2x8;float  _3x8;float  _4x8;float  _5x8;float  _6x8;float  _7x8;float  _8x8;float  _9x8;float  _10x8;
  float  _0x9;float  _1x9;float  _2x9;float  _3x9;float  _4x9;float  _5x9;float  _6x9;float  _7x9;float  _8x9;float  _9x9;float  _10x9;
  float _0x10;float _1x10;float _2x10;float _3x10;float _4x10;float _5x10;float _6x10;float _7x10;float _8x10;float _9x10;float _10x10;
};

uniform float time;
uniform vec2 size;
uniform float opacity;
uniform float threshold;
uniform vec3 bloom_color;
uniform sampler2D screen;
uniform ConvolutionMatrix convolution_matrix;

varying vec2 vCoords;
varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

PixelMatrix pixels(sampler2D texture, float x, float y, vec2 step) {
  vec2 step1 = step;
  vec2 step2 = step*2.;
  vec2 step3 = step*3.;
  vec2 step4 = step*4.;
  vec2 step5 = step*5.;

  return PixelMatrix(
    texture2D(screen, vec2(x -  step5.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step5.y)),
    texture2D(screen, vec2(x           , y -  step5.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step5.y)),

    texture2D(screen, vec2(x -  step5.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step4.y)),
    texture2D(screen, vec2(x           , y -  step4.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step4.y)),

    texture2D(screen, vec2(x -  step5.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step3.y)),
    texture2D(screen, vec2(x           , y -  step3.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step3.y)),

    texture2D(screen, vec2(x -  step5.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step2.y)),
    texture2D(screen, vec2(x           , y -  step2.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step2.y)),

    texture2D(screen, vec2(x -  step5.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step1.y)),
    texture2D(screen, vec2(x           , y -  step1.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step1.y)),

    texture2D(screen, vec2(x -  step5.x, y           )),
    texture2D(screen, vec2(x -  step4.x, y           )),
    texture2D(screen, vec2(x -  step3.x, y           )),
    texture2D(screen, vec2(x -  step2.x, y           )),
    texture2D(screen, vec2(x -  step1.x, y           )),
    texture2D(screen, vec2(x           , y           )),
    texture2D(screen, vec2(x -  step1.x, y           )),
    texture2D(screen, vec2(x -  step2.x, y           )),
    texture2D(screen, vec2(x -  step3.x, y           )),
    texture2D(screen, vec2(x -  step4.x, y           )),
    texture2D(screen, vec2(x -  step5.x, y           )),

    texture2D(screen, vec2(x -  step5.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step1.y)),
    texture2D(screen, vec2(x           , y -  step1.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step1.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step1.y)),

    texture2D(screen, vec2(x -  step5.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step2.y)),
    texture2D(screen, vec2(x           , y -  step2.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step2.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step2.y)),

    texture2D(screen, vec2(x -  step5.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step3.y)),
    texture2D(screen, vec2(x           , y -  step3.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step3.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step3.y)),

    texture2D(screen, vec2(x -  step5.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step4.y)),
    texture2D(screen, vec2(x           , y -  step4.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step4.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step4.y)),

    texture2D(screen, vec2(x -  step5.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step5.y)),
    texture2D(screen, vec2(x           , y -  step5.y)),
    texture2D(screen, vec2(x -  step1.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step2.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step3.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step4.x, y -  step5.y)),
    texture2D(screen, vec2(x -  step5.x, y -  step5.y))
  );
}

vec4 convolve(PixelMatrix p, ConvolutionMatrix m) {
  return (
     m._0x0*p._0x0  +  m._1x0*p._1x0  +  m._2x0*p._2x0  +  m._3x0*p._3x0  +  m._4x0*p._4x0  +  m._5x0*p._5x0  +  m._6x0*p._6x0  +  m._7x0*p._7x0  +  m._8x0*p._8x0  +  m._9x0*p._9x0  +  m._10x0*p._10x0  +
     m._0x1*p._0x1  +  m._1x1*p._1x1  +  m._2x1*p._2x1  +  m._3x1*p._3x1  +  m._4x1*p._4x1  +  m._5x1*p._5x1  +  m._6x1*p._6x1  +  m._7x1*p._7x1  +  m._8x1*p._8x1  +  m._9x1*p._9x1  +  m._10x1*p._10x1  +
     m._0x2*p._0x2  +  m._1x2*p._1x2  +  m._2x2*p._2x2  +  m._3x2*p._3x2  +  m._4x2*p._4x2  +  m._5x2*p._5x2  +  m._6x2*p._6x2  +  m._7x2*p._7x2  +  m._8x2*p._8x2  +  m._9x2*p._9x2  +  m._10x2*p._10x2  +
     m._0x3*p._0x3  +  m._1x3*p._1x3  +  m._2x3*p._2x3  +  m._3x3*p._3x3  +  m._4x3*p._4x3  +  m._5x3*p._5x3  +  m._6x3*p._6x3  +  m._7x3*p._7x3  +  m._8x3*p._8x3  +  m._9x3*p._9x3  +  m._10x3*p._10x3  +
     m._0x4*p._0x4  +  m._1x4*p._1x4  +  m._2x4*p._2x4  +  m._3x4*p._3x4  +  m._4x4*p._4x4  +  m._5x4*p._5x4  +  m._6x4*p._6x4  +  m._7x4*p._7x4  +  m._8x4*p._8x4  +  m._9x4*p._9x4  +  m._10x4*p._10x4  +
     m._0x5*p._0x5  +  m._1x5*p._1x5  +  m._2x5*p._2x5  +  m._3x5*p._3x5  +  m._4x5*p._4x5  +  m._5x5*p._5x5  +  m._6x5*p._6x5  +  m._7x5*p._7x5  +  m._8x5*p._8x5  +  m._9x5*p._9x5  +  m._10x5*p._10x5  +
     m._0x6*p._0x6  +  m._1x6*p._1x6  +  m._2x6*p._2x6  +  m._3x6*p._3x6  +  m._4x6*p._4x6  +  m._5x6*p._5x6  +  m._6x6*p._6x6  +  m._7x6*p._7x6  +  m._8x6*p._8x6  +  m._9x6*p._9x6  +  m._10x6*p._10x6  +
     m._0x7*p._0x7  +  m._1x7*p._1x7  +  m._2x7*p._2x7  +  m._3x7*p._3x7  +  m._4x7*p._4x7  +  m._5x7*p._5x7  +  m._6x7*p._6x7  +  m._7x7*p._7x7  +  m._8x7*p._8x7  +  m._9x7*p._9x7  +  m._10x7*p._10x7  +
     m._0x8*p._0x8  +  m._1x8*p._1x8  +  m._2x8*p._2x8  +  m._3x8*p._3x8  +  m._4x8*p._4x8  +  m._5x8*p._5x8  +  m._6x8*p._6x8  +  m._7x8*p._7x8  +  m._8x8*p._8x8  +  m._9x8*p._9x8  +  m._10x8*p._10x8  +
     m._0x9*p._0x9  +  m._1x9*p._1x9  +  m._2x9*p._2x9  +  m._3x9*p._3x9  +  m._4x9*p._4x9  +  m._5x9*p._5x9  +  m._6x9*p._6x9  +  m._7x9*p._7x9  +  m._8x9*p._8x9  +  m._9x9*p._9x9  +  m._10x9*p._10x9  +
    m._0x10*p._0x10 + m._1x10*p._1x10 + m._2x10*p._2x10 + m._3x10*p._3x10 + m._4x10*p._4x10 + m._5x10*p._5x10 + m._6x10*p._6x10 + m._7x10*p._7x10 + m._8x10*p._8x10 + m._9x10*p._9x10 + m._10x10*p._10x10
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

vec4 high_pass(vec4 p, float threshold, vec3 color) {
  return vec4(color, (p.r + p.g + p.b)/3. < threshold ? 0. : 1.);
}

vec4 bloom(sampler2D texture, float x, float y, float opacity, float threshold, vec2 step) {
  PixelMatrix p = pixels(texture, x, y, step);
  vec4 source = vec4(p._2x2.r, p._2x2.g, p._2x2.b, p._2x2.a);

  p._0x0  = high_pass(p._0x0,  threshold, bloom_color);
  p._1x0  = high_pass(p._1x0,  threshold, bloom_color);
  p._2x0  = high_pass(p._2x0,  threshold, bloom_color);
  p._3x0  = high_pass(p._3x0,  threshold, bloom_color);
  p._4x0  = high_pass(p._4x0,  threshold, bloom_color);
  p._5x0  = high_pass(p._5x0,  threshold, bloom_color);
  p._6x0  = high_pass(p._6x0,  threshold, bloom_color);
  p._7x0  = high_pass(p._7x0,  threshold, bloom_color);
  p._8x0  = high_pass(p._8x0,  threshold, bloom_color);
  p._9x0  = high_pass(p._9x0,  threshold, bloom_color);
  p._10x0 = high_pass(p._10x0, threshold, bloom_color);

  p._0x1  = high_pass(p._0x1,  threshold, bloom_color);
  p._1x1  = high_pass(p._1x1,  threshold, bloom_color);
  p._2x1  = high_pass(p._2x1,  threshold, bloom_color);
  p._3x1  = high_pass(p._3x1,  threshold, bloom_color);
  p._4x1  = high_pass(p._4x1,  threshold, bloom_color);
  p._5x1  = high_pass(p._5x1,  threshold, bloom_color);
  p._6x1  = high_pass(p._6x1,  threshold, bloom_color);
  p._7x1  = high_pass(p._7x1,  threshold, bloom_color);
  p._8x1  = high_pass(p._8x1,  threshold, bloom_color);
  p._9x1  = high_pass(p._9x1,  threshold, bloom_color);
  p._10x1 = high_pass(p._10x1, threshold, bloom_color);

  p._0x2  = high_pass(p._0x2,  threshold, bloom_color);
  p._1x2  = high_pass(p._1x2,  threshold, bloom_color);
  p._2x2  = high_pass(p._2x2,  threshold, bloom_color);
  p._3x2  = high_pass(p._3x2,  threshold, bloom_color);
  p._4x2  = high_pass(p._4x2,  threshold, bloom_color);
  p._5x2  = high_pass(p._5x2,  threshold, bloom_color);
  p._6x2  = high_pass(p._6x2,  threshold, bloom_color);
  p._7x2  = high_pass(p._7x2,  threshold, bloom_color);
  p._8x2  = high_pass(p._8x2,  threshold, bloom_color);
  p._9x2  = high_pass(p._9x2,  threshold, bloom_color);
  p._10x2 = high_pass(p._10x2, threshold, bloom_color);

  p._0x3  = high_pass(p._0x3,  threshold, bloom_color);
  p._1x3  = high_pass(p._1x3,  threshold, bloom_color);
  p._2x3  = high_pass(p._2x3,  threshold, bloom_color);
  p._3x3  = high_pass(p._3x3,  threshold, bloom_color);
  p._4x3  = high_pass(p._4x3,  threshold, bloom_color);
  p._5x3  = high_pass(p._5x3,  threshold, bloom_color);
  p._6x3  = high_pass(p._6x3,  threshold, bloom_color);
  p._7x3  = high_pass(p._7x3,  threshold, bloom_color);
  p._8x3  = high_pass(p._8x3,  threshold, bloom_color);
  p._9x3  = high_pass(p._9x3,  threshold, bloom_color);
  p._10x3 = high_pass(p._10x3, threshold, bloom_color);

  p._0x4  = high_pass(p._0x4,  threshold, bloom_color);
  p._1x4  = high_pass(p._1x4,  threshold, bloom_color);
  p._2x4  = high_pass(p._2x4,  threshold, bloom_color);
  p._3x4  = high_pass(p._3x4,  threshold, bloom_color);
  p._4x4  = high_pass(p._4x4,  threshold, bloom_color);
  p._5x4  = high_pass(p._5x4,  threshold, bloom_color);
  p._6x4  = high_pass(p._6x4,  threshold, bloom_color);
  p._7x4  = high_pass(p._7x4,  threshold, bloom_color);
  p._8x4  = high_pass(p._8x4,  threshold, bloom_color);
  p._9x4  = high_pass(p._9x4,  threshold, bloom_color);
  p._10x4 = high_pass(p._10x4, threshold, bloom_color);

  p._0x5  = high_pass(p._0x5,  threshold, bloom_color);
  p._1x5  = high_pass(p._1x5,  threshold, bloom_color);
  p._2x5  = high_pass(p._2x5,  threshold, bloom_color);
  p._3x5  = high_pass(p._3x5,  threshold, bloom_color);
  p._4x5  = high_pass(p._4x5,  threshold, bloom_color);
  p._5x5  = high_pass(p._5x5,  threshold, bloom_color);
  p._6x5  = high_pass(p._6x5,  threshold, bloom_color);
  p._7x5  = high_pass(p._7x5,  threshold, bloom_color);
  p._8x5  = high_pass(p._8x5,  threshold, bloom_color);
  p._9x5  = high_pass(p._9x5,  threshold, bloom_color);
  p._10x5 = high_pass(p._10x5, threshold, bloom_color);

  p._0x6  = high_pass(p._0x6,  threshold, bloom_color);
  p._1x6  = high_pass(p._1x6,  threshold, bloom_color);
  p._2x6  = high_pass(p._2x6,  threshold, bloom_color);
  p._3x6  = high_pass(p._3x6,  threshold, bloom_color);
  p._4x6  = high_pass(p._4x6,  threshold, bloom_color);
  p._5x6  = high_pass(p._5x6,  threshold, bloom_color);
  p._6x6  = high_pass(p._6x6,  threshold, bloom_color);
  p._7x6  = high_pass(p._7x6,  threshold, bloom_color);
  p._8x6  = high_pass(p._8x6,  threshold, bloom_color);
  p._9x6  = high_pass(p._9x6,  threshold, bloom_color);
  p._10x6 = high_pass(p._10x6, threshold, bloom_color);

  p._0x7  = high_pass(p._0x7,  threshold, bloom_color);
  p._1x7  = high_pass(p._1x7,  threshold, bloom_color);
  p._2x7  = high_pass(p._2x7,  threshold, bloom_color);
  p._3x7  = high_pass(p._3x7,  threshold, bloom_color);
  p._4x7  = high_pass(p._4x7,  threshold, bloom_color);
  p._5x7  = high_pass(p._5x7,  threshold, bloom_color);
  p._6x7  = high_pass(p._6x7,  threshold, bloom_color);
  p._7x7  = high_pass(p._7x7,  threshold, bloom_color);
  p._8x7  = high_pass(p._8x7,  threshold, bloom_color);
  p._9x7  = high_pass(p._9x7,  threshold, bloom_color);
  p._10x7 = high_pass(p._10x7, threshold, bloom_color);

  p._0x8  = high_pass(p._0x8,  threshold, bloom_color);
  p._1x8  = high_pass(p._1x8,  threshold, bloom_color);
  p._2x8  = high_pass(p._2x8,  threshold, bloom_color);
  p._3x8  = high_pass(p._3x8,  threshold, bloom_color);
  p._4x8  = high_pass(p._4x8,  threshold, bloom_color);
  p._5x8  = high_pass(p._5x8,  threshold, bloom_color);
  p._6x8  = high_pass(p._6x8,  threshold, bloom_color);
  p._7x8  = high_pass(p._7x8,  threshold, bloom_color);
  p._8x8  = high_pass(p._8x8,  threshold, bloom_color);
  p._9x8  = high_pass(p._9x8,  threshold, bloom_color);
  p._10x8 = high_pass(p._10x8, threshold, bloom_color);

  p._0x9  = high_pass(p._0x9,  threshold, bloom_color);
  p._1x9  = high_pass(p._1x9,  threshold, bloom_color);
  p._2x9  = high_pass(p._2x9,  threshold, bloom_color);
  p._3x9  = high_pass(p._3x9,  threshold, bloom_color);
  p._4x9  = high_pass(p._4x9,  threshold, bloom_color);
  p._5x9  = high_pass(p._5x9,  threshold, bloom_color);
  p._6x9  = high_pass(p._6x9,  threshold, bloom_color);
  p._7x9  = high_pass(p._7x9,  threshold, bloom_color);
  p._8x9  = high_pass(p._8x9,  threshold, bloom_color);
  p._9x9  = high_pass(p._9x9,  threshold, bloom_color);
  p._10x9 = high_pass(p._10x9, threshold, bloom_color);

  p._0x10  = high_pass(p._0x10,  threshold, bloom_color);
  p._1x10  = high_pass(p._1x10,  threshold, bloom_color);
  p._2x10  = high_pass(p._2x10,  threshold, bloom_color);
  p._3x10  = high_pass(p._3x10,  threshold, bloom_color);
  p._4x10  = high_pass(p._4x10,  threshold, bloom_color);
  p._5x10  = high_pass(p._5x10,  threshold, bloom_color);
  p._6x10  = high_pass(p._6x10,  threshold, bloom_color);
  p._7x10  = high_pass(p._7x10,  threshold, bloom_color);
  p._8x10  = high_pass(p._8x10,  threshold, bloom_color);
  p._9x10  = high_pass(p._9x10,  threshold, bloom_color);
  p._10x10 = high_pass(p._10x10, threshold, bloom_color);

  vec4 color = convolve(p, convolution_matrix);

  float f = opacity*color.a;

  return vec4(color.rgb*f + source.rgb*(1. - f), 1.);
}

void main() {
  gl_FragColor = bloom(screen, vUv.x, vUv.y, opacity, threshold, vec2(1./size.x, 1./size.y));

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
