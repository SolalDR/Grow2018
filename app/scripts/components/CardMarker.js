import config from "./../config.js";
import refMarkersDatas from "./../../datas/refMarkers.json";
import vertexShader from "./../../glsl/cardMarker.vert";
import fragmentShader from "./../../glsl/cardMarker.frag";

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
    this.pointerDistance = null;
		this.debug = true;
	}

  /**
   * init marker
   * @param textures - recto verso textures
   */
	init(textures) {
	  this.generateMesh(textures);
	  this.setPositionCoords();
  }


  /**
   * Generate marker mesh
   */
  generateMesh(textures) {

    // Generate instance geometry
    var rectoGeometry = new THREE.PlaneGeometry( 40, 40/config.cards.ratio);
    var versoGeometry = new THREE.PlaneGeometry( 40, 40/config.cards.ratio);
    versoGeometry.rotateY(Math.PI);
    versoGeometry.computeVertexNormals();

    // Create mesh
    var rectoMesh = new THREE.Mesh(rectoGeometry);
    var versoMesh = new THREE.Mesh(versoGeometry);

    // Create a geomatry with both sides merged
    var geometry = new THREE.Geometry();
    rectoMesh.updateMatrix(); // as needed
    geometry.merge(rectoMesh.geometry, rectoMesh.matrix);

    versoMesh.updateMatrix(); // as needed
    geometry.merge(versoMesh.geometry, versoMesh.matrix);

    // Setup uniforms
    this.uniforms = {
      img_recto: {type: "t", value: textures.recto },
      img_verso: {type: "t", value: textures.verso },
      coords: { type: 'v2', value: this.card.coords },
      opacity: { type: 'f', value: 0.0},
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
    this.mesh.name = 'marker - ' + this.card.title;
    this.mesh.meta = {
      title: this.card.title
    };

    // render false
    this.mesh.visible = false;

  }

  /**
   * Set x, y position from gps coordinates
   */
  setPositionCoords() {

    // DEBUG CARD / TODO: remove
    if(this.card.rank === 1 && this.debug) {
      //var debugMarker = this.mesh.clone();
      console.log(this.card.title, this.card.rank, this.card.coords);
      this.mesh.position.set(250, 80, 20);
      this.mesh.rotation.set(1.5, 1.4, 0);
      return;
    } else {
      this.mesh.rotation.set(1.5, 0, 0);
    }


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
