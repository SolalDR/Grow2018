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

uniform vec2 step;
uniform sampler2D passed;
uniform ConvolutionMatrix matrix;
uniform vec2 resolution;
uniform vec2 center;
uniform float radius;

varying vec2 vUv;

PixelMatrix pixels(sampler2D texture, float x, float y, vec2 step) {
  vec2 s1 = step;
  vec2 s2 = step*2.;

  return PixelMatrix(
    texture2D(texture, vec2(x - s2.x, y - s2.y)),
    texture2D(texture, vec2(x - s1.x, y - s2.y)),
    texture2D(texture, vec2(x       , y - s2.y)),
    texture2D(texture, vec2(x + s1.x, y - s2.y)),
    texture2D(texture, vec2(x + s2.x, y - s2.y)),

    texture2D(texture, vec2(x - s2.x, y - s1.y)),
    texture2D(texture, vec2(x - s1.x, y - s1.y)),
    texture2D(texture, vec2(x       , y - s1.y)),
    texture2D(texture, vec2(x + s1.x, y - s1.y)),
    texture2D(texture, vec2(x + s2.x, y - s1.y)),

    texture2D(texture, vec2(x - s2.x, y       )),
    texture2D(texture, vec2(x - s1.x, y       )),
    texture2D(texture, vec2(x       , y       )),
    texture2D(texture, vec2(x + s1.x, y       )),
    texture2D(texture, vec2(x + s2.x, y       )),

    texture2D(texture, vec2(x - s2.x, y + s1.y)),
    texture2D(texture, vec2(x - s1.x, y + s1.y)),
    texture2D(texture, vec2(x       , y + s1.y)),
    texture2D(texture, vec2(x + s1.x, y + s1.y)),
    texture2D(texture, vec2(x + s2.x, y + s1.y)),

    texture2D(texture, vec2(x - s2.x, y + s2.y)),
    texture2D(texture, vec2(x - s1.x, y + s2.y)),
    texture2D(texture, vec2(x       , y + s2.y)),
    texture2D(texture, vec2(x + s1.x, y + s2.y)),
    texture2D(texture, vec2(x + s2.x, y + s2.y))
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

void main() {
  // gl_FragColor = texture2D(depth, vUv.xy);
  vec4 color = texture2D(passed, vUv.xy);
  // float intensity = texture2D(depth, vUv.xy).r;
  // float intensity = abs(gl_FragCoord.y/resolution.y - .5)*2.;
  float intensity = sqrt(pow(gl_FragCoord.x - center.x, 2.) + pow(gl_FragCoord.y - center.y, 2.))/radius;

  if(intensity != 0.) {
    gl_FragColor = (1. - intensity)*color + intensity*convolve(pixels(passed, vUv.x, vUv.y, step), matrix);
  }
  else {
    gl_FragColor = color;
  }
}
