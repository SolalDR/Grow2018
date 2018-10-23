import config from "./../config.js";
import vertexShader from "./../../glsl/water.vert";
import fragmentShader from "./../../glsl/water.frag";

class Water {
  constructor(){
    this.geometry = new THREE.PlaneBufferGeometry(5000, 5000, 1, 1);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        u_map: { type: "t", value: null }
      }
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI/2;
  }
}

export default Water;
