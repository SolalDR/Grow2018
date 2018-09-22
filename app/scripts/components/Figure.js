import config from "./../config.js";
import vertexShader from "./../../glsl//ghost/ghost.vert";
import fragmentShader from "./../../glsl/ghost/ghost.frag";
import 'three/examples/js/loaders/OBJLoader2.js';

class Figure {
	
	constructor(args){
		this.cardSize = args.cardSize;
		this.rect = {
			topLeft: args.label.topleft,
			bottomRight: args.label.bottomright,
			width: args.label.bottomright.x - args.label.topleft.x,
			height: args.label.bottomright.y - args.label.topleft.y,
		};
		this.confidence = args.label.confidence;
		this.label = args.label.label;
		this.rank = args.rank;

		this.group = new THREE.Group();
		this.boxSize = {
			width: 50,
			height:70
		}

		this.box = null;
		this.model = null;
		this.modelMesh = null;
		this.modelMeshMaterial = null;

		// reveal anim times (in sec)
		this.revealStart = 1 + this.rank * 0.1;
				console.log(this.revealStart);
		this.revealDuration = 6;
	
		this.createMesh();
		this.loadModel(() => {
			//this.modelFitInBox();
			this.setupModel();
			this.setupMaterial();
		});
	}

	createMesh() {

		 // geometry
		var geometry = new THREE.BoxGeometry( this.rect.width/10, this.rect.height/10, 3 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

		this.box = new THREE.Mesh( geometry, material );

		// Set positions
		var cardTop =  {
			x: -this.cardSize.width * config.cardDetail.scaleFactor/2,
			y: this.cardSize.height * config.cardDetail.scaleFactor/2// + this.rect.height/2;
		}
		var figureTop = {
			x: this.rect.topLeft.x + this.rect.width/2,
			y: this.rect.topLeft.y + this.rect.height/2
		}

		// ad to group
		//this.group.add( this.box );

		// position group
		this.group.position.x = (cardTop.x + figureTop.x) / config.cardDetail.scaleFactor;
		this.group.position.y = (cardTop.y - figureTop.y) / config.cardDetail.scaleFactor;
		this.group.position.z = config.figure.maxDistance - this.rect.width;
		console.log(config);

	}

	modelFitInBox() {

		// sizes
		//console.log(this.box.getSize());
		// boxes
		var box = new THREE.Box3().setFromObject( this.box );
		var modelBox = new THREE.Box3().setFromObject( this.model );
		//sizes
		var boxSize = box.getSize();
		var modelBoxSize = modelBox.getSize();
		// ratio 
		var ratio = boxSize.divide( modelBoxSize ); // get the ratio of the sizes
		// get max in ratio vec3
		var maxRatio = Object.keys(ratio).reduce((max, key) => {
			return ratio[key] > max ? ratio[key] : max
		}, 0);
		//.reduce((max, key) => o[key].value > max ? o[key].value : max, 0);


		//model.scale = model.scale * 1 / maxRatio 
		//console.log(this.getModelMesh());
		//this.modelMesh.scale.set(maxRatio,maxRatio,maxRatio);


	}

	loadModel(callback) {
		var modelName = 'silhouette';
		var modelPaths = config.figure.modelPaths;
		var modelKey = Math.floor(Math.random() * modelPaths.length);
		var modelPath = modelPaths[modelKey]


		var objLoader = new THREE.OBJLoader2();
		var callbackOnLoad = ( content ) => {

			this.model = content;

			this.model.traverse( ( child ) => {

			    if ( child instanceof THREE.Mesh ) {
			    		//var material = new THREE.MeshPhongMaterial( {color: 0x00ff00} );
			        //child.material = material;
			        this.modelMesh = child;

			    }

			} );
			this.group.add( this.model );

			callback();
			console.log( 'Loading .obj complete: ' + content );
		};

		var loaded = () => {
			objLoader.load( modelPath, callbackOnLoad );
		};
			
		loaded();
	}

	setupModel() {
		//this.model.rotation.y = 2.4;
		this.model.position.y = - (this.rect.height/2)/config.cardDetail.scaleFactor;
	}

	setupMaterial() {
		var customUniforms = {
			delta: {value: 0},
			time: {value: 0.0},
			startTime: {value: this.revealStart},
			duration: {value: this.revealDuration}
		};

		this.modelMeshMaterial = new THREE.ShaderMaterial({
			uniforms: customUniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		});
		this.modelMesh.material = this.modelMeshMaterial;

		// set transparancy
		this.modelMesh.material.transparent = true;

		// fix overlapping glitches
		this.modelMesh.material.polygonOffset = true;
		this.modelMesh.material.polygonOffsetFactor = -0.1;

		// set vertexDisplacement
		this.vertexDisplacement = new Float32Array(this.modelMesh.geometry.attributes.position.count);

		for (var i = 0; i < this.vertexDisplacement.length; i ++) {
			this.vertexDisplacement[i] = Math.sin(i);
		}

		this.modelMesh.geometry.addAttribute('vertexDisplacement', new THREE.BufferAttribute(this.vertexDisplacement, 1));
	}

	renderMaterial(elapsedTime) {

		//uniform
    this.modelMesh.material.uniforms.delta.value = 0.5 + Math.sin(elapsedTime*0.001) * 0.1;
    this.modelMesh.material.uniforms.time.value += 1/60;

		for (var i = 0; i < this.vertexDisplacement.length; i ++) {
		    this.vertexDisplacement[i] = i * 0.5 + Math.sin(i + elapsedTime*0.001) * 0.5;
		}

		this.modelMesh.geometry.attributes.vertexDisplacement.needsUpdate = true;
	}

	render(elapsedTime) {
		this.renderMaterial(elapsedTime)
	}
}

export default Figure;