import config from "./../config.js";
import refMarkersDatas from "./../../datas/refMarkers.json";

/**
 * Card Marker object on map
 */
class CardMarker {

  /**
   * @constructor
   * @param  {Object} cardData
   */
	constructor(args) {
		this.cardData = args.cardData;
		this.refMarkersDatas = refMarkersDatas;

		this.mesh = null;

    this.generateMesh();
    this.setPositionCoords();
	}


  /**
   * Generate marker mesh
   */
  generateMesh() {

    // create mesh
    var geometry = new THREE.SphereGeometry(8, 4, 4, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshNormalMaterial();
    material.transparent = true;
    material.opacity = 0;
    this.mesh = new THREE.Mesh(geometry, material);

    // set position
    this.mesh.position.y = config.markers.elevation;

    // set data
    this.mesh.name = 'marker';
    this.mesh.meta = {
      title: this.cardData.titre
    };


  }

  /**
   * Set x, y position from gps coordinates
   */
  setPositionCoords() {

    // map from latitude to x
    this.mesh.position.x = THREE.Math.mapLinear(
      this.cardData.coords.latitude,
      this.refMarkersDatas.bottomRight.coords.latitude,
      this.refMarkersDatas.topLeft.coords.latitude,
      config.markers.refs.bottomRight.x,
      config.markers.refs.topLeft.x
    );

    // map from longitude to z
    this.mesh.position.z = THREE.Math.mapLinear(
      this.cardData.coords.longitude,
      this.refMarkersDatas.bottomRight.coords.longitude,
      this.refMarkersDatas.topLeft.coords.longitude,
      config.markers.refs.bottomRight.z,
      config.markers.refs.topLeft.z
    );

  }
}


export default CardMarker;
