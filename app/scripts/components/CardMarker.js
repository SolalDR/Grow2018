import config from "./../config.js";
import refMarkersDatas from "./../../datas/refMarkers.json";
import vertexShader from "./../../glsl/cardMarker.vert";
import fragmentShader from "./../../glsl/cardMarker.frag";
import BufferGeometryUtils from "../helpers/BufferGeometryUtils";
import Animation from "../helpers/Animation";

/**
 * Card Marker object on map
 */
class CardMarker {

  /**
   * @constructor
   * @param  {Object} Logic model of the card
   * @attribute  {Object} card
   */
	constructor(card) {
		this.card = card;
		this.refMarkersDatas = refMarkersDatas;
		this.debug = config.markers.debug;
    this.startOpacity = this.debug ? 1.0 :  0.0;
    this.pointerDistance = null;
    this.active = false;

    this._fadingAway = null;
	}

  /**
   * init marker
   * @param textures - recto verso textures
   */
	init(textures) {
	  this.textures = textures;
	  this.generateMesh();
	  if(!this.card.position) {
      this.setPositionCoords();
    }
  }

  /**
   * Create marker geometru
   */
  createGeometry() {

    // Generate instance geometry
    var rectoGeometry = new THREE.PlaneBufferGeometry( 40, 40/config.cards.ratio, 1, 1);
    var versoGeometry = new THREE.PlaneBufferGeometry( 40, 40/config.cards.ratio, 1, 1);
    versoGeometry.rotateY(Math.PI);
    versoGeometry.computeVertexNormals();

    // Create a geomatry with both sides merged
    this.geometry =  BufferGeometryUtils.merge([rectoGeometry, versoGeometry]);
  }

  /**
   * Create marker material
   */
  createMaterial() {

    // Setup uniforms
    this.uniforms = {
      img_recto: {type: "t", value: this.textures.recto },
      img_verso: {type: "t", value: this.textures.verso },
      coords: { type: 'v2', value: this.card.coords },
      opacity: { type: 'f', value: this.startOpacity},
    };

    // Shader Material
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      alphaTest: true
    });
  }

  /**
   * Generate marker
   */
  generateMesh() {

    this.createGeometry();
    this.createMaterial();

    // Mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    //this.mesh.doubleSided = true;

    // set position
    this.setPosition();

    // set rotation
    this.setRotation();

    // set data
    this.mesh.name = (this.card.rank + 2) + ' - marker - ' + this.card.title;
    this.mesh.meta = {
      title: this.card.title
    };

    // render false
    if(!this.debug) {
      this.mesh.visible = false;
    }
  }

  setRotation() {
    if(this.card.rotation) {
      this.mesh.rotation.set(
        this.card.rotation.x,
        this.card.rotation.y,
        this.card.rotation.z
      );
    }
    // Restore Orientation
    if(this.card.isVertical) {
      this.mesh.rotation.z = Math.PI/2;
    } else {
      this.mesh.rotation.z = Math.PI;
    }
  }

  setPosition() {
    if(this.card.position) {
      this.mesh.position.copy(this.card.position);
    }
    this.mesh.position.y = config.markers.elevation;
    if(this.card.position) console.log('Class: CardMarker, Function: setPosition, Line 118 this.mesh.position(): ', this.mesh.position);
  }

  fadeAway({ duration = null, onFinish = null } = {}){
    this._fadingAway = new Animation({
      timingFunction: "easeInQuint",
      from: this.mesh.position.y,
      to: 300,
      duration: duration
    });

    this._fadingAway.on("end", ()=>{
      this._fadingAway = null;
      this.mesh.visible = false;
    })

    if( onFinish ) this._fadingAway.on("end", onFinish.bind(this));

    this._fadingAway.on("progress", (event)=> {
      this.mesh.position.y = event.value;
      this.mesh.rotation.x += event.advancement*2.5;
      this.mesh.rotation.z += event.advancement*5;
      this.uniforms.opacity.value  = 1 - event.advancement;
    });

    return this._fadingAway;
  }

  /**
   * Set x, y position from gps coordinates
   */
  setPositionCoords() {

    // map from latitude to x
    this.mesh.position.x = THREE.Math.mapLinear(
      this.card.gpsCoords.latitude,
      this.refMarkersDatas.bottomRight.coords.latitude,
      this.refMarkersDatas.topLeft.coords.latitude,
      config.markers.refs.bottomRight.x,
      config.markers.refs.topLeft.x
    );

    // map from longitude to z
    this.mesh.position.z = THREE.Math.mapLinear(
      this.card.gpsCoords.longitude,
      this.refMarkersDatas.bottomRight.coords.longitude,
      this.refMarkersDatas.topLeft.coords.longitude,
      config.markers.refs.bottomRight.z,
      config.markers.refs.topLeft.z
    );

    if(config.markers.debug) {
      //this.setDebugCardPos();
    }
  }

  /**
   * render in THREE js raf
   * @param delta {Number} - time
   */
  render(delta) {
    if (this._fadingAway !== null) {
      this._fadingAway.render(delta);
    }
  }


  // TODO: temp method
  /**
   * make first card in front of camera on intro for debug
   */
  setDebugCardPos() {
    if(this.card.rank === 1) {
      this.mesh.position.set(200, 80, 15);
      this.mesh.rotation.set(Math.PI, Math.PI/3, 0);
    }
  }
}


export default CardMarker;
