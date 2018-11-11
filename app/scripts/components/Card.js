import config from "./../config.js";
import CardMarker from "./CardMarker";

/**
 * Logic model representing a single card
 */
class Card {

  /**
   * @constructor
   * @param  {Object} datas The cards datas (from "/app/datas/datas.json")
   * @param  {Object} args  Additionnals infos
   * @attribute verso The verso images load from "/static/images/cards/..."
   * @attribute recto The recto images load from "/static/images/cards/..."
   * @attribute title Card title
   * @attribute versoUrl
   * @attribute rectoURl
   * @attribute year
   * @attribute rank
   * @attribute gpsCoords lat, ln of the card's photo position
   * @attribute position in scene pos (x, y, z)
   * @attribute rotation in scene rotation (x, y, z)
   * @attribute isWorking Some images aren't working
   * @attribute collected is Card in added in Collection
   * @attribute onLoad card loaded
   * @attribute coords Get the coords in the sprite texture
   * @attribute marker postcard marker thumb on 3d map
   */
	constructor(datas, args = {}) {
		this.verso = null;
		this.recto = null;
		this.title = datas.title;
		this.versoUrl = datas.img_verso;
		this.rectoUrl = datas.img_recto;
    this.year = datas.year;
		this.rank = datas.img_rank - 1;
    this.gpsCoords = datas.coords;
    this.position = datas.position;
    this.rotation = datas.rotation;
		this.isWorking = datas.img_working;
		this.isPortrait = datas.img_portrait;
    this.onLoad = args.onLoad ? args.onLoad : false;
    this.collected = false;
		this.coords = this.computeCoords();
    this.marker = new CardMarker(this);
	}


  /**
   * Compute coords from img_rank & grid size
   * @return {Object} Return a vector2
   */
	computeCoords() {
		return {
			x: this.rank%config.cards.grid.size,
			y: Math.floor(this.rank/config.cards.grid.size)
		}
	}


  /**
   * Compute coords from image to map with uv
   * @param  {Image} image
   * @return {Object} return a vector 2
   */
	getCoordsInImage(image){
		var coords = this.computeCoords();
		return {
			x: Math.floor(coords.x*(image.width/config.cards.grid.size) + (image.width/config.cards.grid.size)/2),
			y: Math.floor(coords.y*(image.height/config.cards.grid.size) + (image.height/config.cards.grid.size)/2)
		}
	}


  /**
   * Load verso & recto texture
   */
	loadTexture(){
		var versoLoad = false, rectoLoad = false;

		this.verso = new Image();
		this.verso.src = this.versoUrl;

		this.recto = new Image();
		this.recto.src = this.rectoUrl;

    var testLoading = function(){
      if( versoLoad && rectoLoad ) {
        this.loaded = true;
        if(this.onLoad) this.onLoad.call(this);
      }
    }

		this.verso.onLoad = (e) => {
			versoLoad = true;
			testLoading.apply(this);
		}

		this.recto.onLoad = (e) => {
			rectoLoad = true;
			testLoading.apply(this);
		}
	}
}

export default Card;
