/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Sepia tone shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.CornerFadeShader = {

  uniforms: {

    "tDiffuse": { value: null },
    "amount":   { value: 1.0 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader:
    `
    uniform float amount; 
    uniform sampler2D tDiffuse;
    varying vec2 vUv;

    void main(){

      vec4 color = texture2D( tDiffuse, vUv );

      float minimum = 0.2;
      float maximum = 0.8;
      float diff = maximum - minimum;

      float dist = (1. - distance(vec2(0.5, 0.5), vUv));
      float intensity = min(max(0., dist - minimum)/diff, 1.);

      vec3 colorCorner = vec3(0., 0., 0.);
      gl_FragColor = vec4( color.rgb*intensity , 1.);
    }
    `

};

export default THREE.CornerFadeShader;