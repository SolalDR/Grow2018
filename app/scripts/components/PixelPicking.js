import config from "./../config.js";
import vertexShader from "./../../glsl/model.vert";
import fragmentShader from "./../../glsl/raycaster.frag";


/**
 * @author Julien Dargelos
 * @class A pixel picking class to replace raycasting on an instance buffer geometry
 */
class PixelPicking {

  /**
   * @constructor
   * @param  {CardsCloud} cardsCloud
   */
  constructor(cardsCloud) {
    this.cardsCloud = cardsCloud
    this.mouse = { x: 0, y: 0 }
    this.scene = new THREE.Scene();
    this.selectedCardRank = -1;
    this.renderer = new THREE.WebGLRenderer( { antialias: false } );
    this.renderer.setClearColor( 0xFFFFFF, 1 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight )

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    window.addEventListener('mousemove', this.onMouseMove.bind(this))

    this.init();
  }


  get cardSelected() {
    return this.selectedCardRank !== -1
  }


  init(){
    var uniforms = Object.assign({}, this.cardsCloud.material.uniforms);
    delete uniforms.img_recto;
    delete uniforms.img_verso;

    this.material = new THREE.RawShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.FrontSide,
      uniforms: uniforms,
    });

    this.mesh = new THREE.Mesh(this.cardsCloud.mesh.geometry, this.material);

    this.scene.add(this.mesh);
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


  // -----------------------------------------


  render() {
    this.mesh.material.uniforms.u_time.value = this.cardsCloud.material.uniforms.u_time.value;
    this.mesh.material.uniforms.u_camera_position.value = this.cardsCloud.material.uniforms.u_camera_position.value;
    this.mesh.material.uniforms.needsUpdate = true;
    this.mesh.material.needsUpdate = true

    this.renderer.render( this.scene, this.cardsCloud.camera, this.renderTarget);
  }


  // -----------------------------------------


  onMouseMove( event ) {
    this.mouse.x = event.clientX
    this.mouse.y = event.clientY
  }

  onWindowResize() {
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderTarget.setSize( window.innerWidth, window.innerHeight );
  }

  onRefreshUniforms() {
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
}

export default PixelPicking
