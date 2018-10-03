import config from "./../config.js";
import vertexShader from "./../../glsl/model.vert";
import fragmentShader from "./../../glsl/raycaster.frag";

class PixelPicking {
  constructor(cardsCloud) {
    this.cardsCloud = cardsCloud

    this.mouse = { x: 0, y: 0 }

    this.scene = new THREE.Scene();
    this.selectedCardRank = -1;

    this.material = new THREE.RawShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.FrontSide,
      uniforms: {
        img_noise: this.cardsCloud.material.uniforms.img_noise,
        img_bumpmap: this.cardsCloud.material.uniforms.img_bumpmap,
        u_noise_translation_intensity: this.cardsCloud.material.uniforms.u_noise_translation_intensity,
        u_noise_translation_speed: this.cardsCloud.material.uniforms.u_noise_translation_speed,
        u_noise_translation_spread: this.cardsCloud.material.uniforms.u_noise_translation_spread,
        u_noise_rotation_intensity: this.cardsCloud.material.uniforms.u_noise_rotation_intensity,
        u_noise_rotation_speed: this.cardsCloud.material.uniforms.u_noise_rotation_speed,
        u_noise_rotation_spread: this.cardsCloud.material.uniforms.u_noise_rotation_spread,
        u_noise_bending_intensity: this.cardsCloud.material.uniforms.u_noise_bending_intensity,
        u_noise_bending_speed: this.cardsCloud.material.uniforms.u_noise_bending_speed,
        u_noise_bending_spread: this.cardsCloud.material.uniforms.u_noise_bending_spread,
        u_camera_position: this.cardsCloud.material.uniforms.u_camera_position,
        u_time: this.cardsCloud.material.uniforms.u_time
      },
      transparent: true,
      depthWrite: true,
      depthTest: true,
      alphaTest: true
    } );

    this.renderer = new THREE.WebGLRenderer( { antialias: false } );
    this.renderer.setClearColor( 0xFFFFFF, 1 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );

    this.renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight )

    this.mesh = new THREE.Mesh(this.cardsCloud.mesh.geometry, this.material);

    this.scene.add(this.mesh);

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    window.addEventListener('mousemove', this.updateMouse.bind(this))
  }

  get cardSelected() {
    return this.selectedCardRank !== -1
  }

  refreshUniforms() {
    this.material.uniforms.u_noise_translation_intensity.value = this.cardsCloud.material.uniforms.u_noise_translation_intensity.value;
    this.material.uniforms.u_noise_translation_speed.value = this.cardsCloud.material.uniforms.u_noise_translation_speed.value;
    this.material.uniforms.u_noise_translation_spread.value = this.cardsCloud.material.uniforms.u_noise_translation_spread.value;
    this.material.uniforms.u_noise_rotation_intensity.value = this.cardsCloud.material.uniforms.u_noise_rotation_intensity.value;
    this.material.uniforms.u_noise_rotation_speed.value = this.cardsCloud.material.uniforms.u_noise_rotation_speed.value;
    this.material.uniforms.u_noise_rotation_spread.value = this.cardsCloud.material.uniforms.u_noise_rotation_spread.value;
    this.material.uniforms.u_noise_bending_intensity.value = this.cardsCloud.material.uniforms.u_noise_bending_intensity.value;
    this.material.uniforms.u_noise_bending_speed.value = this.cardsCloud.material.uniforms.u_noise_bending_speed.value;
    this.material.uniforms.u_noise_bending_spread.value = this.cardsCloud.material.uniforms.u_noise_bending_spread.value;
    this.material.uniforms.needsUpdate = true;
  }

  updateSelectedRank() {
    var color = new Uint8Array( 4 );

    this.renderer.readRenderTargetPixels(
      this.renderTarget,
      this.mouse.x,
      this.renderTarget.height - this.mouse.y,
      1,
      1,
      color
    );

    var x = color[0]
    var y = color[1]

    if(x === 255 && y === 255) this.selectedCardRank = -1;
    else this.selectedCardRank = Math.round(x/255*config.cards.grid.size) + Math.round(y/255*config.cards.grid.size)*config.cards.grid.size;
  }

  render() {
    this.mesh.material.uniforms.u_time.value = this.cardsCloud.material.uniforms.u_time.value;
    this.mesh.material.uniforms.u_camera_position.value = this.cardsCloud.material.uniforms.u_camera_position.value;
    this.mesh.material.uniforms.needsUpdate = true;
    this.mesh.material.needsUpdate = true

    this.renderer.render( this.scene, this.cardsCloud.camera, this.renderTarget);
  }

  updateMouse( event ) {
    this.mouse.x = event.clientX
    this.mouse.y = event.clientY
  }

  onWindowResize() {
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderTarget.setSize( window.innerWidth, window.innerHeight );
  }
}

export default PixelPicking
