import config from "./../config.js";

class Card {
	
	constructor(datas, args = {}) {
		this.verso = null;
		this.recto = null;

		this.id = datas.ID;
		this.title = datas.title;
		this.author = datas.author;
		this.year = datas.year;
		this.versoUrl = datas.img_verso;
		this.rectoUrl = datas.img_recto;
		this.rank = datas.img_rank - 1;
		this.isWorking = datas.img_working;
		
		this.onLoad = args.onLoad ? args.onLoad : false;

		this.coords = this.getCoords();
	}

	getCoords() {
		return {
			x: this.rank%config.cards.grid.size,
			y: Math.floor(this.rank/config.cards.grid.size)
		}
	}

	getCoordsInImage(image){
		var coords = this.getCoords();
		return {
			x: Math.floor(coords.x*(image.width/config.cards.grid.size) + (image.width/config.cards.grid.size)/2),
			y: Math.floor(coords.y*(image.height/config.cards.grid.size) + (image.height/config.cards.grid.size)/2)
		}
	}


	loadTexture(){
		var versoLoad = false, rectoLoad = false;

		this.verso = new Image();
		this.verso.src = this.versoUrl;

		this.recto = new Image();
		this.recto.src = this.rectoUrl;

		this.verso.onLoad = (e) => {
			console.log(e);
			versoLoad = true;
			if( versoLoad && rectoLoad ) {
				this.loaded = true;
				if(this.onLoad) this.onLoad.call(this);
			}
		}

		this.recto.onLoad = (e) => {
			console.log(e);
			rectoLoad = true;
			if( versoLoad && rectoLoad ) {
				this.loaded = true;
				if(this.onLoad) this.onLoad.call(this);
			}
		}
	}
}

export default Card;