import config from "./../config.js";
import vertexShader from "./../../glsl/model.vert";
import fragmentShader from "./../../glsl/model.frag";
import BufferGeometryUtils from "./../helpers/BufferGeometryUtils.js";

console.log();
class CardsCloud {

	constructor(args){
		this.cards = args.cards;
		this.gui = args.gui;
		this.camera = args.camera;
		var c = config.cards;

		const count = this.cards.length; 

		this.recto = new THREE.TextureLoader().load( "/static/images/img_recto.jpg" );
		var verso = new THREE.TextureLoader().load( "/static/images/img_verso.jpg" );
		var noise = new THREE.TextureLoader().load( "/static/images/noise_3d.png" );
		var bumpmap = new THREE.TextureLoader().load( "/static/images/card_bump.jpg" );

		let rectoGeometry = new THREE.PlaneBufferGeometry( c.width, c.height, c.widthSegments, c.heightSegments );
		let versoGeometry = new THREE.PlaneBufferGeometry( c.width, c.height, c.widthSegments, c.heightSegments );		
		versoGeometry.rotateY(Math.PI);

		versoGeometry.computeVertexNormals();

		var geometryInstance = BufferGeometryUtils.merge([rectoGeometry, versoGeometry]);

		let geometry = new THREE.InstancedBufferGeometry().copy(geometryInstance);


		
    	let scale = new Float32Array( count * 3 );
    	let translation = new Float32Array( count * 3 );
	    let rotation = new Float32Array( count * 4 );
	    let coords = new Float32Array( count * 2 );
	    let ranks = new Float32Array( count );

	    var q = new THREE.Quaternion();
	    for(let i=0; i<this.cards.length; i++){

	    	coords[ i*2 ] = this.cards[i].coords.x
	    	coords[ i*2 + 1 ] = 18 - this.cards[i].coords.y

	    	ranks[ i ] = this.cards[i].rank;

	    	translation[ i*3 ] = ( Math.random() - .5 ) * 700;
        	translation[ i*3 + 1 ] = ( Math.random() - .5 ) * 700;
        	translation[ i*3 + 2 ] = ( Math.random() - .5 ) * 700;

        	q.set(  ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, Math.random() * Math.PI );
        	q.normalize();

        	rotation[ i*4 ] = q.x;
	        rotation[ i*4 + 1 ] = q.y;
	        rotation[ i*4 + 2 ] = q.z;
	        rotation[ i*4 + 3 ] = q.w;

	        scale[ i*3 ] = 1;
	        scale[ i*3 + 1 ] = 1;
	        scale[ i*3 + 2 ] = 1;
	    }
		   	
	   	geometry.addAttribute( 'translation', new THREE.InstancedBufferAttribute( translation, 3, 1 ) );
	    geometry.addAttribute( 'rotation', new THREE.InstancedBufferAttribute( rotation, 4, 1 ) );
	    geometry.addAttribute( 'scale', new THREE.InstancedBufferAttribute( scale, 3, 1 ) );
	    geometry.addAttribute( 'coords', new THREE.InstancedBufferAttribute( coords, 2, 1 ) );
	    geometry.addAttribute( 'rank', new THREE.InstancedBufferAttribute( ranks, 1, 1 ) );

	    this.material = new THREE.RawShaderMaterial( {
	        vertexShader: vertexShader,
	        fragmentShader: fragmentShader,
	        side:THREE.FrontSide,
	        uniforms: {
	        	img_recto: 						{ type: "t", value: this.recto },
	        	img_verso: 						{ type: "t", value: verso },
	        	img_noise: 						{ type: "t", value: noise },
	        	img_bumpmap: 					{ type: "t", value: bumpmap },
	        	u_noise_translation_intensity: 	{ type: "f", value: config.cards.translation.intensity },
	        	u_noise_translation_speed: 		{ type: "f", value: config.cards.translation.speed },
	        	u_noise_translation_spread: 	{ type: "f", value: config.cards.translation.spread },
	        	u_noise_rotation_intensity: 	{ type: "f", value: config.cards.rotation.intensity },
	        	u_noise_rotation_speed: 		{ type: "f", value: config.cards.rotation.speed },
	        	u_noise_rotation_spread: 		{ type: "f", value: config.cards.rotation.spread },
	        	u_noise_bending_intensity: 	{ type: "f", value: config.cards.bending.intensity },
	        	u_noise_bending_speed: 			{ type: "f", value: config.cards.bending.speed },
	        	u_noise_bending_spread: 		{ type: "f", value: config.cards.bending.spread },
	        	u_camera_position: 					{ type: "v3", value: this.camera.position },
	        	u_time: 										{ type: "f", value: 0 }
	        },
	        transparent: true,
	        depthWrite: true,
	        depthTest: true,
	        alphaTest: true
	    } );

	    this.mesh = new THREE.Mesh( geometry, this.material );

	    this.initGui();
	}

	initGui(){
		var args = ["intensity", "speed", "spread"];
		var positionF = this.gui.addFolder("Positions");
		var rotationF = this.gui.addFolder("Rotations");
		var bendingF = this.gui.addFolder("Bending");
		args.forEach(arg => {
			positionF.add(config.cards.translation, arg).onChange(this.refreshUniforms.bind(this));
			rotationF.add(config.cards.rotation, arg).onChange(this.refreshUniforms.bind(this));
			bendingF.add(config.cards.bending, arg).onChange(this.refreshUniforms.bind(this));
		}) 
	}

	refreshUniforms(){
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
	}

	render(elapsedTime) {
		var time = elapsedTime*0.001*0.001;
		this.mesh.material.uniforms.u_time.value = time;
		this.mesh.material.uniforms.u_camera_position.value = this.camera.position;
		this.mesh.material.uniforms.needsUpdate = true;
		this.mesh.material.needsUpdate = true
	}
}

export default CardsCloud;