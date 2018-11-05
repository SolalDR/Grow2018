import EffectComposer from './postprocess/EffectComposer.js';
import ShaderPass from './postprocess/ShaderPass.js';
import RenderPass from './postprocess/RenderPass.js';
import FilmPass from './postprocess/FilmPass.js';
import FilmShader from './postprocess/FilmShader.js';
import CopyShader from 'three/examples/js/shaders/CopyShader.js';

class PostProcessing {
  constructor(renderer, scene, camera) {
    this.composer = new EffectComposer(renderer);

    this.passes = [
      new RenderPass(scene, camera),
      new FilmPass(1, 1, 1, 1)
    ];

    this.lastPass.renderToScreen = true;
    this.passes.forEach(pass => this.composer.addPass(pass));
  }

  get lastPass() {
    return this.passes[this.passes.length - 1];
  }

  render() {
    this.composer.render();
  }
}

export default PostProcessing;
