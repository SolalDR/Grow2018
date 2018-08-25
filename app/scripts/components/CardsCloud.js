import config from "./../config.js";
import vertexShader from "./../../glsl/model.vert";
import fragmentShader from "./../../glsl/model.frag";

class CardsCloud {

	constructor(args){
		this.cards = args.cards;
		this.gui = args.gui;

		const count = this.cards.length; 

		this.recto = new THREE.TextureLoader().load( "/static/images/img_recto.jpg" );
		var verso = new THREE.TextureLoader().load( "/static/images/img_verso.jpg" );
		var noise = new THREE.TextureLoader().load( "/static/images/noise_3d.png" );
		var bumpmap = new THREE.TextureLoader().load( "/static/images/card_bump.jpg" );

		let geometry = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneBufferGeometry( 
			config.cards.width, 
			config.cards.height, 
			config.cards.widthSegments, 
			config.cards.heightSegments 
		));
		
		
    	let scale = new Float32Array( count * 3 );
    	let translation = new Float32Array( count * 3 );
	    let rotation = new Float32Array( count * 4 );
	    let coords = new Float32Array( count * 2 );
	    let ranks = new Float32Array( count );

	    var q = new THREE.Quaternion();
	    for(let i=0; i<this.cards.length; i++){

	    	coords[ i ] = this.cards[i].coords.x
	    	coords[ i + 1 ] = this.cards[i].coords.y

	    	ranks[ i ] = this.cards[i].rank;

	    	translation[ i*3 ] = ( Math.random() - .5 ) * 400;
        	translation[ i*3 + 1 ] = ( Math.random() - .5 ) * 400;
        	translation[ i*3 + 2 ] = ( Math.random() - .5 ) * 400;

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

	    this.material = new THREE.ShaderMaterial( {
	        vertexShader: vertexShader,
	        fragmentShader: fragmentShader,
	        side:THREE.DoubleSide,
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
	        	u_time: 						{ type: "f", value: 0 }
	        },
	        transparent: true
	    } );

	    this.mesh = new THREE.Mesh( geometry, this.material );

	    this.initGui();
	}

	initGui(){
		var args = ["intensity", "speed", "spread"];
		args.forEach(arg => {
			this.gui.add(config.cards.translation, arg).name("translate_"+arg).onChange(this.refreshUniforms.bind(this));
			this.gui.add(config.cards.rotation, arg).name("rotate_"+arg).onChange(this.refreshUniforms.bind(this));;
		}) 
	}

	refreshUniforms(){
		this.material.uniforms.u_noise_translation_intensity.value = config.cards.translation.intensity;
		this.material.uniforms.u_noise_translation_speed.value = config.cards.translation.speed;
		this.material.uniforms.u_noise_translation_spread.value = config.cards.translation.spread;
		this.material.uniforms.u_noise_rotation_intensity.value = config.cards.rotation.intensity;
		this.material.uniforms.u_noise_rotation_speed.value = config.cards.rotation.speed;
		this.material.uniforms.u_noise_rotation_spread.value = config.cards.rotation.spread;
		this.material.uniforms.needsUpdate = true;
	}

	render(elapsedTime) {
		var time = elapsedTime*0.001*0.001;
		this.mesh.material.uniforms.u_time.value = time;
		this.mesh.material.uniforms.needsUpdate = true;
	}
}

export default CardsCloud;