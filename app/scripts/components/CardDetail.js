import config from "./../config.js";
import datas from "./../../datas/samplesRecoLabel.json";
import Figure from "./Figure.js";


class CardDetail {

	constructor(args){
		this.card = args.card;
		this.gui = args.gui;
		this.camera = args.camera;
		this.cardSize = {
			width:120,
			height:80.4
		};
		this.object3D = new THREE.Object3D();
		this.cvRectoTexture; 
		this.texturesLoaded = false;
		this.imagePath = 'static/cardRecoSample/images/';
		this.imagesSrc = [];
		this.imagesPr = [];
		this.textures = [];
		this.labels = [];
		this.figures = [];

		// For demo 
		this.getRandomCard();

		// load textures
		this.loadTextures(this.imagesSrc, () => {
			// create card mesh
			this.createMesh();
			// create figures from labels data
			this.createFigures();
			// add figures to group
			this.addFigures();
		});

		
		//console.log(this.card);
	  this.initGui();
	  //this.createMesh();
	}

	getRandomCard() {
		var key = Math.floor(Math.random() * datas.length);
		var cardData = datas[key]; //datas[key];
		this.imagesSrc = [
			this.imagePath + cardData.img_recto,
			this.imagePath + cardData.img_verso
		];
		this.labels = cardData.labels;
	}

	initGui(){
		var args = ["intensity", "speed", "spread"];
		var positionF = this.gui.addFolder("Detail");
		args.forEach(arg => {
			//positionF.add(config.cards.translation, arg).onChange();
		}) 
	}

	loadTextures(imagesSrc, callback) {

		// Load textures	
		for (var i = 0; i < imagesSrc.length; i++) {
			var src = imagesSrc[i];
			this.imagesPr.push(new Promise((resolve, reject) => {
				var loader = new THREE.TextureLoader();
				loader.setCrossOrigin( 'Anonymous');
				var key = i;
				var texture = loader.load( src, () => {
					this.textures[key] = texture;
					this.cardSize.width = texture.image.width/config.cardDetail.scaleFactor;
					this.cardSize.height = texture.image.height/config.cardDetail.scaleFactor;
					resolve();			
				});
			}));
		}

		// On textures loaded
		Promise.all(this.imagesPr).then(() => {
  		callback();
  		this.texturesLoaded = true;
		}).catch(function(errtextures) {
  		console.error(errtextures)
		});	
	}


	createFigures() {
		// create figures for labels in card
		for (var i = 0; i < this.labels.length; i++) {
			var labelData = this.labels[i];
			// if label is person or horse (oui des fois les gens sont des cheveaux)
			if(labelData.label === 'person' || labelData.label === 'horse') {
				console.log('labelData.label', labelData.label);
				this.figures.push(new Figure({
					cardSize:this.cardSize, 
					label:labelData,
					rank:i
				}));
			}
		}
	}

	addFigures() {
		this.figures.forEach((figure) => {
			this.object3D.add(figure.group);
					console.log('figure.group', figure.group);
		});
	}

	createMesh() {
		 // geometry
    var geometry1 = new THREE.PlaneGeometry( this.cardSize.width, this.cardSize.height, 1, 1 );            
    var geometry2 = new THREE.PlaneGeometry( this.cardSize.width, this.cardSize.height, 1, 1 );            
    geometry2.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI ) );
        
    // textures
    // this.textureFront = new THREE.Texture(this.textures[0]);
    // this.textureBack = new THREE.Texture(this.textures[1]);

    // material
    var material1 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: this.textures[0] } );
    var material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: this.textures[1] } );

    // Debug material
    //var material1 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    //var material2 = new THREE.MeshBasicMaterial( { color: 0x0000ff } );

    // mesh card faces
    var mesh1 = new THREE.Mesh( geometry1, material1 );
    this.object3D.add( mesh1 );
    var mesh2 = new THREE.Mesh( geometry2, material2 );
    this.object3D.add( mesh2 );

    // transform position
    this.object3D.rotation.y = 0.8;
	}

	render(elapsedTime) {
		//this.object3D.rotation.y += 0.001;

		if(this.texturesLoaded) {
			this.textures.forEach((texture) => {
				//texture.needsUpdate = true;
			})
			this.figures.forEach((figure) => {
				// render figures
				figure.render(elapsedTime);
			});
		}
	}


}

export default CardDetail;