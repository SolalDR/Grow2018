import vert from "../../glsl/fxaa.vert";
import frag from "../../glsl/fxaa.frag";
THREE.FxaaShader = {
 
  uniforms: {
    "tDiffuse": { type: 't', value: new THREE.Texture() },
    "resolution": { type: 'v2', value: new THREE.Vector2() }
  },

  vertexShader: vert,
  fragmentShader: frag
}

export default THREE.FxaaShader;