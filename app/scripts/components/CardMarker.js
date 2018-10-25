import config from "./../config.js";
import refMarkersDatas from "./../../datas/refMarkers.json";
import vertexShader from "./../../glsl/cardMarker.vert";
import fragmentShader from "./../../glsl/cardMarker.frag";
import BufferGeometryUtils from "../helpers/BufferGeometryUtils";

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
    this.pointerDistance = null;
    this.startOpacity = this.debug ? 1.0 :  0.0;
	}

  /**
   * init marker
   * @param textures - recto verso textures
   */
	init(textures) {
	  this.generateMesh(textures);
	  if(this.card.position) {
	    this.setPosition();
    } else {
      this.setPositionCoords();
    }
  }


  /**
   * Generate marker mesh
   */
  generateMesh(textures) {

    // Generate instance geometry
    var rectoGeometry = new THREE.PlaneBufferGeometry( 40, 40/config.cards.ratio);
    var versoGeometry = new THREE.PlaneBufferGeometry( 40, 40/config.cards.ratio);
    versoGeometry.rotateY(Math.PI);
    versoGeometry.computeVertexNormals();

    // Create a geomatry with both sides merged
    var geometry =  BufferGeometryUtils.merge([rectoGeometry, versoGeometry]);

    // Setup uniforms
    this.uniforms = {
      img_recto: {type: "t", value: textures.recto },
      img_verso: {type: "t", value: textures.verso },
      coords: { type: 'v2', value: this.card.coords },
      opacity: { type: 'f', value: this.startOpacity},
    };

    // Shader Material
    var material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      alphaTest: true
    });

    // Mesh
    this.mesh = new THREE.Mesh(geometry, material);
    //this.mesh.doubleSided = true;

    // set position
    this.mesh.position.y = config.markers.elevation;

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
      this.mesh.rotation.set(this.card.rotation);
    }
  }

  setPosition() {
    if(this.card.position) {
      this.mesh.position.set(this.card.position);
    }
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

  }
}


export default CardMarker;
