import vertex from '../../glsl/postprocessing.vert'
import fragment from '../../glsl/postprocessing.frag'
import config from "./../config.js";
import gaussianConvolutionMatrix from 'gaussian-convolution-kernel'

class PostProcessing {
  constructor(renderer, gui) {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = renderer;
    this.gui = gui
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
          opacity: {type: "float", value: 0},
          threshold: {type: "float", value: 0},
          step: {type: "float", value: 0},
          bloom_color: {type: "c", value: new THREE.Color(config.postprocessing.color)},
          screen: {type: "t", value: this.target.texture},
          convolution_matrix: {value: {}}
        },
        vertexShader: vertex,
        fragmentShader: fragment
      })
    );

    this.mesh.frustumCulled = false;
    this.onRefreshUniforms();
    this.updateConvolutionMatrix();

    this.scene.add(this.mesh);

    this.initGUI();
  }

  initGUI() {
    var postProcessing = this.gui.addFolder("post processing");

    postProcessing.add(config.postprocessing, 'active');

    postProcessing.add(config.postprocessing, 'opacity', 0, 1)
      .onChange(this.onRefreshUniforms.bind(this));

    postProcessing.add(config.postprocessing, 'threshold', 0, 1)
      .onChange(this.onRefreshUniforms.bind(this));

    postProcessing.add(config.postprocessing, 'step', 0, 0.1)
      .onChange(this.onRefreshUniforms.bind(this));

    postProcessing.add(config.postprocessing, 'sigma', 0.01, 1000)
      .onChange(this.updateConvolutionMatrix.bind(this));

    postProcessing.addColor(config.postprocessing, 'color')
      .onChange(value => { this.mesh.material.uniforms.bloom_color.value = new THREE.Color(value); });
  }

  updateConvolutionMatrix() {
    var value = {};

    gaussianConvolutionMatrix(5, config.postprocessing.sigma).forEach((factor, index) => {
      value[`_${index%5}x${Math.floor(index/5)}`] = factor;
    });

    this.mesh.material.uniforms.convolution_matrix.value = value
    this.mesh.material.uniforms.needsUpdate = true;
  }

  render(scene, camera) {
    this.renderer.clear();

    if(!config.postprocessing.active) {
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

  onRefreshUniforms() {
    this.mesh.material.uniforms.opacity.value = config.postprocessing.opacity;
    this.mesh.material.uniforms.threshold.value = config.postprocessing.threshold;
    this.mesh.material.uniforms.step.value = config.postprocessing.step;
    this.mesh.material.uniforms.needsUpdate = true;
  }
}

export default PostProcessing;
