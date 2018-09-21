import config from "./../config.js";

class Figure {
	
	constructor(args){
		this.cardSize = args.cardSize;
		this.boxSize = {
			width: 50,
			height:70
		}
		this.rect = {
			topLeft: args.label.topleft,
			bottomRight: args.label.bottomright,
			width: args.label.bottomright.x - args.label.topleft.x,
			height: args.label.bottomright.y - args.label.topleft.y,
		};
				console.table(this.rect);
		this.confidence = args.label.confidence;
		this.label = args.label.label;
		this.mesh = null;
	
		this.createMesh();
	}

	createMesh() {
		 // geometry
		var geometry = new THREE.BoxGeometry( this.rect.width/10, this.rect.height/10, 3 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		this.mesh = new THREE.Mesh( geometry, material );
				console.log(config);
		//this.mesh.position.x = this.rect.topLeft.x/10;
		//this.mesh.position.x = this.rect.topLeft.x/10;
		var cardTop =  {
			x: -this.cardSize.width * config.cardDetail.scaleFactor/2,
			y: this.cardSize.height * config.cardDetail.scaleFactor/2// + this.rect.height/2;
		}
		var figureTop = {
			x: this.rect.topLeft.x + this.rect.width/2,
			y: this.rect.topLeft.y + this.rect.height/2
		}
		//this.mesh.position.y = ( ( (this.cardSize.height*config.cardDetail.scaleFactor)/2 + this.rect.height/2 ) - this.rect.topLeft.y - this.rect.height/2 ) / config.cardDetail.scaleFactor;//this.rect.topLeft.y/10;
		this.mesh.position.x = (cardTop.x + figureTop.x) / config.cardDetail.scaleFactor;
		this.mesh.position.y = (cardTop.y - figureTop.y) / config.cardDetail.scaleFactor;

		this.mesh.position.z = this.rect.width;
	}

	render() {

	}
}

export default Figure;