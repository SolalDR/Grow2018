import config from "./../config.js";



class CardDetail {

	constructor(args){
		this.card = args.card;
		this.gui = args.gui;
		this.camera = args.camera;
		this.object3D = new THREE.Object3D();
		this.cvRectoTexture; 
		this.texturesLoaded = false;
		this.imagesSrc = ['/static/images/img_recto.jpg', '/static/images/img_verso.jpg'];
		this.imagesPr = [];
		this.cvTextures = [];
		this.textureFront;
		this.textureBack;
		

		// Load textures	
		this.imagesSrc.forEach((src) => {
				this.imagesPr.push(new Promise((resolve, reject) => {
					var loader = new THREE.TextureLoader();
					loader.setCrossOrigin( 'Anonymous');
					var texture = loader.load( src, () => {
						var cvTexture = this.getCardTexture(texture);
						resolve(cvTexture);			
					});
				}));
		});

		// On textures loaded
		Promise.all(this.imagesPr).then((cvTextures) => {
			console.log('success');
			this.cvTextures = cvTextures;
  		this.createMesh();
		}).catch(function(errtextures) {
  		console.error(errtextures)
		});	

		// this.recto = new THREE.TextureLoader().load( "/static/images/img_recto.jpg", ()=>{
		// 	this.cvRectoTexture = this.getCardTexture(this.recto);
		// } );
		// this.verso = new THREE.TextureLoader().load( "/static/images/img_verso.jpg" );

		//console.log(this.card);
	  this.initGui();
	  //this.createMesh();
	}

	initGui(){
		var args = ["intensity", "speed", "spread"];
		var positionF = this.gui.addFolder("Detail");
		args.forEach(arg => {
			//positionF.add(config.cards.translation, arg).onChange();
		}) 
	}

	getCardTexture(textureObj) {
		var cv = document.createElement('canvas');
		cv.width = cv.style.width = 256;  //textureObj.image.width;
    cv.height = cv.style.height = 256; //textureObj.image.height;
    var ctx = cv.getContext('2d');
    document.body.appendChild(cv);

    // ctx.fillRect(0, 0, cv.width, cv.height);
    // ctx.fillStyle = 'white';
    // ctx.fillRect(10, 10, cv.width - 20, cv.height - 20);
    // ctx.fillStyle = 'black';
    // ctx.textAlign = "center";
    // ctx.textBaseline = "middle";
    // ctx.fillText(new Date().getTime(), cv.width / 2, cv.height / 2);

    var coords = this.card.getCoordsInImage(textureObj.image);
    		console.log(coords);

		//ctx.drawImage(recto.image, 0, 0, recto.image.width, recto.image.height);
		ctx.drawImage(textureObj.image, 430, 0, 412, 273, 0, 0, cv.width, cv.height);
		//drawImage(image, sx, sy, sLargeur, sHauteur, dx, dy, dLargeur, dHauteur)
		return cv;
	}

	createMesh() {
				console.log('create mesh');
		 // geometry
    var geometry1 = new THREE.PlaneGeometry( 140, 90, 1, 1 );            
    var geometry2 = new THREE.PlaneGeometry( 140, 90, 1, 1 );            
    geometry2.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI ) );
        
    // textures
    this.textureFront = new THREE.Texture(this.cvTextures[0]);
    		console.log(this.textureFront);
    this.textureBack = new THREE.Texture(this.cvTextures[1]);

    // material
    var material1 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: this.textureFront } );
    var material2 = new THREE.MeshBasicMaterial( { color: 0xffffff, map: this.textureBack } );
    // Debug texture
    //var material1 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    //var material2 = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    
    
    // mesh
    var mesh1 = new THREE.Mesh( geometry1, material1 );
    this.object3D.add( mesh1 );
    var mesh2 = new THREE.Mesh( geometry2, material2 );
    this.object3D.add( mesh2 );

    this.texturesLoaded = true;
	}

	render(elapsedTime) {
		this.object3D.rotation.y += 0.001;
		if(this.texturesLoaded) {

			this.textureFront.needsUpdate = true;
			this.textureBack.needsUpdate = true;
		}
	}


}

export default CardDetail;