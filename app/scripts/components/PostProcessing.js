import config from "./../config.js";
import gaussianConvolutionMatrix from 'gaussian-convolution-kernel';
import fxaaVertex from '../../glsl/fxaa.vert';
import fxaa from '../../glsl/fxaa.frag';

import vertex from '../../glsl/postprocessing/postprocessing.vert';
import identity from '../../glsl/postprocessing/identity.frag';
import invert from '../../glsl/postprocessing/invert.frag';
import convolution from '../../glsl/postprocessing/convolution.frag';
import low from '../../glsl/postprocessing/low.frag';
import high from '../../glsl/postprocessing/high.frag';
import blend from '../../glsl/postprocessing/blend.frag';
import plain from '../../glsl/postprocessing/plain.frag';
import erosion from '../../glsl/postprocessing/erosion.frag';
import dilatation from '../../glsl/postprocessing/dilatation.frag';
import wind from '../../glsl/postprocessing/wind.frag';
import focus from '../../glsl/postprocessing/focus.frag';

class PostProcessing {
  constructor(renderer, gui) {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderer = renderer;
    this.gui = gui
    this.renderer.autoClear = false;
    this.time = 0;
    this.read = (pass, index, scene, camera) => {
      var target = this.targets[index%2]
      this.renderer.render(scene, camera, target);
      pass.uniforms.passed.value = target.texture;
      this.renderer.render(pass, this.camera, this.source);
    };
    this.draw = pass => this.renderer.render(pass, this.camera);
    this.chain = (pass, index) => this.renderer.render(pass, this.camera, this.targets[index%2]);
    this.divide = (pass, index) => {
      var target = this.targets[index%2];
      target.setSize(target.width/4, target.height/4);
      this.chain(pass, index);
      this.targets[(index + 1)%2].setSize(target.width, target.height);
    };
    this.overwrite = (pass, index) => {
      var target = this.targets[index%2]
      this.renderer.render(pass, this.camera, target);
      pass.uniforms.passed.value = target.texture;
      this.renderer.render(pass, this.camera, this.source);
    };
    this.multiply = (pass, index) => {
      var target = this.targets[index%2];
      target.setSize(target.width*4, target.height*4);
      this.chain(pass, index);
      this.targets[(index + 1)%2].setSize(target.width, target.height);
    };
    this.passes = [];
    this.targets = new Array(3).fill().map(() => {
      return new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter
      });
    });
    this.source = this.targets[2];
    this.initTime = Date.now();
    this.time = 0;

    var gauss = this.convolution(gaussianConvolutionMatrix(5, 10));

    this.pass(this.read);
    // this.pass(fxaa, this.overwrite).vertex = fxaaVertex;
    this.pass(fxaa).vertex = fxaaVertex;
    // this.pass(focus, {matrix: {value: gauss}});
    // this.pass(focus, {matrix: {value: gauss}});
    // this.pass(focus, {matrix: {value: gauss}});
    // this.pass(focus, {matrix: {value: gauss}});
    // this.pass(focus, {matrix: {value: gauss}}, this.draw);
    // this.pass(fxaa).vertex = fxaaVertex;
    // this.pass(fxaa).vertex = fxaaVertex;
    // this.pass(fxaa).vertex = fxaaVertex;
    // this.pass(fxaa).vertex = fxaaVertex;
    // this.pass(fxaa, this.overwrite).vertex = fxaaVertex;
    this.pass(high, {threshold: {value: 0.95}}, this.divide);
    // this.pass(erosion, {intensity: {value: 20}}, this.divide);
    // this.pass(dilatation, {intensity: {value: 5}}, this.divide);
    // this.pass(dilatation, {intensity: {value: 5}});
    // this.pass(dilatation, {intensity: {value: 5}});
    // this.pass(dilatation, {intensity: {value: 3}});
    for(var i = 0; i < 7; i++) {
      this.pass(convolution, {matrix: {value: gauss}});
    }

    this.pass(convolution, {matrix: {value: gauss}}, this.multiply);
    this.pass(convolution, {matrix: {value: gauss}});
    this.pass(blend, this.draw);
    // this.pass(identity, this.draw);
    //this.pass(high, {threshold: {value: 1.}}, this.draw);
    // this.pass(plain, {color: {value: [0, 0, 0, 1]}}, this.overwrite);
    // this.pass(blend, this.draw)
    // this.pass(convolution, {matrix: {value: gauss}});
    // this.pass(convolution, {matrix: {value: gauss}});
    // this.pass(convolution, {matrix: {value: gauss}});
    // this.pass(convolution, {matrix: {value: gauss}});
    // this.pass(convolution, {matrix: {value: gauss}});
    // this.pass(convolution, {matrix: {value: gauss}});
    // this.pass(convolution, {matrix: {value: gauss}});
    // this.pass(convolution, {matrix: {value: gauss}});
    // this.pass(blend, this.draw);

    this.initGUI();
  }

  pass(fragment, uniforms = {}, render = null) {
    if(typeof fragment === 'function') {
      render = fragment;
      fragment = identity;
    }
    else if(typeof uniforms === 'function') {
      render = uniforms;
      uniforms = {};
    };

    if(typeof render !== 'function') render = this.chain

    var pass = new THREE.Scene();
    var mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: Object.assign({
          source: {type: 't', value: null},
          depth: {type: 't', value: null},
          passed: {type: 't', value: null},
          time: {type: 'float', value: null},
          resolution: {type: 'vec2', value: new THREE.Vector2()},
          step: {type: 'vec2', value: new THREE.Vector2()},
        }, uniforms),
        transparent: true,
        vertexShader: vertex,
        fragmentShader: fragment
      })
    );

    mesh.frustumCulled = false;
    pass.add(mesh);

    Object.defineProperties(pass, {
      uniforms: {
        get: () => mesh.material.uniforms
      },
      vertex: {
        get: () => mesh.material.vertexShader,
        set: v => { mesh.material.vertexShader = v}
      },
      fragment: {
        get: () => mesh.material.fragmentShader,
        set: v => { mesh.material.fragmentShader = v}
      },
      render: {
        value: render,
        writable: true
      }
    })

    this.passes.push(pass);

    return pass;
  }

  convolution(matrix) {
    return matrix.reduce((value, factor, index) => {
      value[`_${index%5}x${Math.floor(index/5)}`] = factor;
      return value;
    }, {});
  }

  initGUI() {
    var postProcessing = this.gui.addFolder("post processing");

    postProcessing.add(config.postprocessing, 'active');

    // postProcessing.add(config.postprocessing, 'opacity', 0, 1)
    //   .onChange(this.onRefreshUniforms.bind(this));

    // postProcessing.add(config.postprocessing, 'threshold', 0, 1)
    //   .onChange(this.onRefreshUniforms.bind(this));

    // postProcessing.add(config.postprocessing, 'sigma', 0.01, 1000)
    //   .onChange(this.updateConvolutionMatrix.bind(this));

    // postProcessing.addColor(config.postprocessing, 'color')
    //   .onChange(value => { this.mesh.material.uniforms.bloom_color.value = new THREE.Color(value); });
  }

  render(scene, camera) {
    this.renderer.clear();
    if(!config.postprocessing.active) return this.renderer.render(scene, camera);
    //var {width, height}  = this.renderer.getSize();
    //this.targets.forEach(target => { target.setSize(0, 0);target.setSize(width, height); });
    this.time = (Date.now() - this.initTime)*0.000001;
    this.passes.forEach((pass, index) => {
      pass.uniforms.time.value = this.time;
      pass.uniforms.source.value = this.source.texture;
      pass.uniforms.depth.value = this.source.depthTexture;
      pass.uniforms.passed.value = this.targets[(index + 1)%2].texture;
      pass.uniforms.needsUpdate = true;
      pass.render(pass, index, scene, camera);
      this.renderer.setRenderTarget(null);
    })
  }

  setSize(width, height) {
    this.renderer.setSize(width, height);
    this.targets.forEach(target => target.setSize(width, height));
    var resolution = new THREE.Vector2(width, height);
    var step = new THREE.Vector2(1/width, 1/height);
    this.passes.forEach(pass => {
      pass.uniforms.resolution.value = resolution;
      pass.uniforms.step.value = step;
    })
  }
}

export default PostProcessing;
