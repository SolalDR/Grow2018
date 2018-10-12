import config from "./../config.js";
import CardMarker from "./CardMarker";

/**
 * The cards markers manager
 */
class CardMarkersManager {

  /**
   * @constructor
   * @param  {Array} cardsData
   * @param {THREE.Scene} scene The three.js scene
   */
  constructor(args) {

    this.data = args.data;
    this.scene = args.scene;

    this.markers = [];

    this.refMarkers = {};

    this.generateMarkers();
  }

  /**
   * Distribute Markers
   */
  generateMarkers() {
    let cardMarker;
    this.data.forEach(data => {

      cardMarker = new CardMarker({
        cardData: data
      });

      console.log('mesh', cardMarker.mesh);

      // add to scene
      this.scene.add(cardMarker.mesh);

      // add to markers
      this.markers.push(cardMarker);

    });
  }

  /**
   * Create reference markers for positions
   */
  createRefMarkers() {

    // Landmarks refs for cards positioning
    var geometry = new THREE.SphereGeometry(8, 4, 4, 0, Math.PI * 2, 0, Math.PI * 2);
    var material = new THREE.MeshNormalMaterial();
    var boundLandmarkMesh = new THREE.Mesh(geometry, material);
    boundLandmarkMesh.position.y = config.markers.elevation;
    this.refMarkers.topLeft = boundLandmarkMesh.clone();
    this.refMarkers.bottomRight = boundLandmarkMesh.clone();

    // top left ref marker
    this.refMarkers.topLeft.name = 'refMarkers.topLeft';
    this.refMarkers.topLeft.position.x = config.markers.refs.topLeft.x;
    this.refMarkers.topLeft.position.z = config.markers.refs.topLeft.z;

    // bottom right ref marker
    this.refMarkers.bottomRight.name = 'refMarkers.bottomRight';
    this.refMarkers.bottomRight.position.x = config.markers.refs.bottomRight.x;
    this.refMarkers.bottomRight.position.z = config.markers.refs.bottomRight.z;
  }

}


export default CardMarkersManager;
