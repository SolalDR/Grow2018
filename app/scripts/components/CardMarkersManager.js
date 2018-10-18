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
   * @param {Pointer} pointer in three.js scene
   */
  constructor(args) {
    this.data = args.data;
    this.scene = args.scene;
    this.pointer = args.pointer;

    this.markers = [];
    this.gridMarkers = Array.from({length: Math.pow(config.markers.grid.size, 2)}, e => Array());

    this.generateMarkers();
    this.generateMarkersGrid();
  }

  /**
   * generate markers from card data and add it
   * to three group
   */
  generateMarkers() {
    let cardMarker;

    // create group
    this.group = new THREE.Group();
    this.group.name = 'Card markers';

    // generate markers
    this.data.forEach(data => {

      cardMarker = new CardMarker({
        cardData: data
      });

      // add to group
      this.group.add(cardMarker.mesh);

      // add to markers array
      this.markers.push(cardMarker);

    });
  }

  /**
   * Generate markers grid for optimised marker picking
   */
  generateMarkersGrid() {

    // marker group bounding box
    this.boundingBox = new THREE.Box3().setFromObject( this.group );

    // init marker grid
    this.grid = {
      size: config.markers.grid.size,
      width: this.boundingBox.max.x - this.boundingBox.min.x,
      height: this.boundingBox.max.z - this.boundingBox.min.z,
    };
    this.grid.cellSize = new THREE.Vector2(this.grid.width / this.grid.size, this.grid.height / this.grid.size);

    // add markers to grid
    this.markers.forEach(marker => {
      // get marker position
      var markerPos = new  THREE.Vector2(marker.mesh.position.x, marker.mesh.position.z);

      // set marker position relative to group bounding box
      marker.grid = {
        pos : new THREE.Vector2(markerPos.x - this.boundingBox.min.x, markerPos.y - this.boundingBox.min.z),
      };

      // get cell x and z
      var markerCell = {
        x: Math.floor(marker.grid.pos.x / this.grid.cellSize.x) + 1,
        z: Math.floor(marker.grid.pos.y / this.grid.cellSize.y) + 1
      };

      // get cell index
      marker.grid.index = markerCell.x * this.grid.size - (this.grid.size - markerCell.z);

      // add to grid markers array
      this.gridMarkers[marker.grid.index - 1].push(marker);
    });

    // add group to scene
    this.scene.add(this.group);
  }

  /**
   * get grid cell from vec2
   * @param {Vector2} pos - current x, y position hover the grid
   * @return {float} cell index from 1
   */
  getGridCell(pos) {
    var grid = this.grid;
    var bbox = this.boundingBox;
    var pointerPosGrid = new THREE.Vector2(pos.x - bbox.min.x, pos.y - bbox.min.z);
    // get cell x and z
    var currentCell = {
      x: Math.floor(pointerPosGrid.x / grid.cellSize.x) + 1,
      y: Math.floor(pointerPosGrid.y / grid.cellSize.y) + 1
    };
    // get cell index
    return currentCell.x * grid.size - (grid.size - currentCell.y);
  }

  /**
   * Get 3/3 cell bloc around target cell
   * @param {float} i - index for cell position in grid
   * @return {array}
   */
  getCellsBloc(i) {
    var gSize = this.grid.size;
    var m = this.gridMarkers;
    return [
      ...m[i - 1],
      ...m[i] || [],
      ...m[i - 2] || [],
      ...m[i - gSize - 1] || [],
      ...m[i - gSize + 1] || [],
      ...m[i + gSize] || [],
      ...m[i + gSize + 1] || [],
      ...m[i + gSize - 1] || [],
    ];
  }

  /**
   * init class events
   */
  initEvents() {
    window.addEventListener('resize', () => this.update());
  }

  /**
   * update in THREE render
   * @param {boolean} mouseHasClick - click event triggered
   */
  update(mouseHasClick) {
    // get pointer pos
    var pointerPos = new THREE.Vector2(this.pointer.group.position.x, this.pointer.group.position.z);
    // get pointer radius
    var pointerRadius = this.pointer.ring.geometry.parameters.outerRadius;

    // set position from grid
    var currentIndex = this.getGridCell(pointerPos);

    // If selected index in grid
    if(currentIndex <= Math.pow(this.grid.size, 2)) {

      // Get hovered cells
      var markerSelection = this.getCellsBloc(currentIndex);

      // if selection contains markers
      if(markerSelection.length > 0) {

        this.hoveredMarker = null;

        // distance opacity
        for ( var i = 0; i < markerSelection.length; i++ ) {
          var marker = markerSelection[i];
          var markerPos = new THREE.Vector2(marker.mesh.position.x, marker.mesh.position.z);
          var distance  = pointerPos.distanceTo(markerPos);
          var maxDistance = 200;
          marker.mesh.material.opacity = THREE.Math.mapLinear(distance, 0, maxDistance, 1, 0);

          // marker Selection
          if(pointerPos.distanceTo(markerPos) < pointerRadius*2) {
            this.hoveredMarker = marker;
          }
        }

        if(mouseHasClick && this.hoveredMarker) {
          console.group('clicked marker');
          console.log('hoveredMarker', this.hoveredMarker);
          if(this.hoveredMarker.mesh.meta.title) {
            console.log('title ', this.hoveredMarker.mesh.meta.title);
          }
          console.log('markerSelection: ', markerSelection);
          console.groupEnd();
        }
      }
    }
  }

}

export default CardMarkersManager;
