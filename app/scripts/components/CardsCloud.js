import config from "./../config.js";
import vertexShader from "./../../glsl/model.vert";
import fragmentShader from "./../../glsl/model.frag";
import raycasterFragmentShader from "./../../glsl/raycaster.frag";
import BufferGeometryUtils from "./../helpers/BufferGeometryUtils.js";
import PixelPicking from "./PixelPicking.js";

/**
 * A mesh containing all the cards with instance buffer geometry
 */
class CardsCloud {

  /**
   * @constructor
   * @param  {Array} cards
   * @param {THREE.PerspectiveCamera} camera The global camera used in pixelPicking
   * @param {Dat.GUI} gui
   */
	constructor(args) {
		this.cards = args.cards;
		this.gui = args.gui;
		this.camera = args.camera;

    this.generateGeometry();
    this.generateMaterial();

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.frustumCulled = false;
    this.pixelPicking = new PixelPicking(this)
    this.initGui();
	}


  /**
   * Generate the instance buffer geometry
   */
  generateGeometry(){
    var c = config.cards;

    // Generate instance geometry
    var rectoGeometry = new THREE.PlaneBufferGeometry( c.width, c.height, c.widthSegments, c.heightSegments );
    var versoGeometry = new THREE.PlaneBufferGeometry( c.width, c.height, c.widthSegments, c.heightSegments );
    versoGeometry.rotateY(Math.PI);
    versoGeometry.computeVertexNormals();
    var geometryInstance = BufferGeometryUtils.merge([rectoGeometry, versoGeometry]);

    // Generate global geometry
    var count = this.cards.length;
    this.geometry = new THREE.InstancedBufferGeometry().copy(geometryInstance);

    // Create empty attributes
    var translation = new Float32Array( count * 3 );
    var rotation = new Float32Array( count * 4 );
    var coords = new Float32Array( count * 2 );
    var ranks = new Float32Array( count );

    var q = new THREE.Quaternion();

    // For each card, generate random attributes & uv coords
    for(let i=0; i<this.cards.length; i++){
      coords[ i*2 ] = this.cards[i].coords.x
      coords[ i*2 + 1 ] = 18 - this.cards[i].coords.y

      ranks[ i ] = this.cards[i].rank;
      translation[ i*3 ] = ( Math.random() - .5 ) * c.translation.bounding;
      translation[ i*3 + 1 ] = ( Math.random() - .5 ) * c.translation.bounding;
      translation[ i*3 + 2 ] = ( Math.random() - .5 ) * c.translation.bounding;

      q.set(  ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, Math.random() * Math.PI );
      q.normalize();

      rotation[ i*4 ] = q.x;
      rotation[ i*4 + 1 ] = q.y;
      rotation[ i*4 + 2 ] = q.z;
      rotation[ i*4 + 3 ] = q.w;
    }

    // Add all the attribuets
    this.geometry.addAttribute( 'translation', new THREE.InstancedBufferAttribute( translation, 3, 1 ) );
    this.geometry.addAttribute( 'rotation', new THREE.InstancedBufferAttribute( rotation, 4, 1 ) );
    this.geometry.addAttribute( 'coords', new THREE.InstancedBufferAttribute( coords, 2, 1 ) );
    this.geometry.addAttribute( 'rank', new THREE.InstancedBufferAttribute( ranks, 1, 1 ) );
  }


  /**
   * Generate custom shader material
   */
  generateMaterial(){
    var c = config.cards;
    var recto = new THREE.TextureLoader().load( "/static/images/img_recto.jpg" );
    var verso = new THREE.TextureLoader().load( "/static/images/img_verso.jpg" );
    var noise = new THREE.TextureLoader().load( "/static/images/noise_3d.png" );
    var bumpmap = new THREE.TextureLoader().load( "/static/images/card_bump.jpg" );

    this.material = new THREE.RawShaderMaterial( {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side:THREE.FrontSide,
      uniforms: {
        img_recto:   { type: "t", value: recto },
        img_verso:   { type: "t", value: verso },
        img_noise:   { type: "t", value: noise },
        img_bumpmap: { type: "t", value: bumpmap },
        selected_card_rank: { type: "f", value: -1 },
        u_based_position:              { type: "v3", value: c.position },
        u_noise_translation_intensity: { type: "f",  value: c.translation.intensity },
        u_noise_translation_speed:     { type: "f",  value: c.translation.speed },
        u_noise_translation_spread:    { type: "f",  value: c.translation.spread },
        u_noise_rotation_intensity:    { type: "f",  value: c.rotation.intensity },
        u_noise_rotation_speed:        { type: "f",  value: c.rotation.speed },
        u_noise_rotation_spread:       { type: "f",  value: c.rotation.spread },
        u_noise_bending_intensity:     { type: "f",  value: c.bending.intensity },
        u_noise_bending_speed:         { type: "f",  value: c.bending.speed },
        u_noise_bending_spread:        { type: "f",  value: c.bending.spread },
        u_camera_position:             { type: "v3", value: this.camera.position },
        u_time:                        { type: "f",  value: 0 }
      },
      transparent: true,
      alphaTest: true
    });
  }


	initGui(){
		var args = ["intensity", "speed", "spread"];
		var positionF = this.gui.addFolder("Positions");
		var rotationF = this.gui.addFolder("Rotations");
		var bendingF = this.gui.addFolder("Bending");
		args.forEach(arg => {
			positionF.add(config.cards.translation, arg).onChange(this.onRefreshUniforms.bind(this));
			rotationF.add(config.cards.rotation, arg).onChange(this.onRefreshUniforms.bind(this));
			bendingF.add(config.cards.bending, arg).onChange(this.onRefreshUniforms.bind(this));
		})
	}


  // -----------------------------------------


	render(elapsedTime) {
		var time = elapsedTime*0.000001;
    this.pixelPicking.updateSelectedRank()
    this.mesh.material.uniforms.selected_card_rank.value = this.pixelPicking.selectedCardRank
		this.mesh.material.uniforms.u_time.value = time;
		this.mesh.material.uniforms.u_camera_position.value = this.camera.position;
		this.mesh.material.uniforms.needsUpdate = true;
		this.mesh.material.needsUpdate = true;
    this.pixelPicking.render();
	}


  // -----------------------------------------


  /**
   * Actualize all the uniforms and force updating
   * @return {[type]} [description]
   */
  onRefreshUniforms (){
    this.material.uniforms.u_noise_translation_intensity.value = config.cards.translation.intensity;
    this.material.uniforms.u_noise_translation_speed.value = config.cards.translation.speed;
    this.material.uniforms.u_noise_translation_spread.value = config.cards.translation.spread;
    this.material.uniforms.u_noise_rotation_intensity.value = config.cards.rotation.intensity;
    this.material.uniforms.u_noise_rotation_speed.value = config.cards.rotation.speed;
    this.material.uniforms.u_noise_rotation_spread.value = config.cards.rotation.spread;
    this.material.uniforms.u_noise_bending_intensity.value = config.cards.bending.intensity;
    this.material.uniforms.u_noise_bending_speed.value = config.cards.bending.speed;
    this.material.uniforms.u_noise_bending_spread.value = config.cards.bending.spread;
    this.material.uniforms.needsUpdate = true;
    this.pixelPicking.onRefreshUniforms();
  }
}


export default CardsCloud;
