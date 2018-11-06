import vertex from '../../glsl/postprocessing.vert'
import fragment from '../../glsl/postprocessing.frag'
import config from "./../config.js";

class PostProcessing {
  constructor(renderer) {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = renderer;
    this.renderer.autoClear = false;
    this.time = 0;
    this.target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      //stencilBuffer: false,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter
    });
    this.scene = new THREE.Scene();
    this.mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: {
          time: {type: "f", value: 0},
          size: {type: "vec2", value: [0, 0]},
          screen: {type: "t", value: this.target.texture}
        },
        vertexShader: vertex,
        fragmentShader: fragment
      })
    );

    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);
  }

  render(scene, camera) {
    this.renderer.clear();
    if( !config.postprocessing.active ){
      this.renderer.render(scene, camera);
      return;
    }

    this.renderer.render(scene, camera, this.target);

    this.renderer.setRenderTarget(null);
    this.mesh.material.uniforms.time.value = (this.mesh.material.uniforms.time.value + 0.00001)%1;
    this.mesh.material.uniforms.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
    this.mesh.material.uniforms.size = new THREE.Vector2(width, height)
    this.mesh.material.uniforms.needsUpdate = true;
  }
}

export default PostProcessing;
