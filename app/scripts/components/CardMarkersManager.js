import config from "./../config.js";
import CardMarker from "./CardMarker";
import Event from "./../helpers/Event";

/**
 * The cards markers manager
 */
class CardMarkersManager extends Event {

  /**
   * @constructor
   * @param  {Array} cardsData
   * @param {THREE.Scene} scene The three.js scene
   * @param {Pointer} pointer in three.js scene
   */
  constructor(args) {
    super();
    this.eventsList = ["click", "hover", "hover:end"];

    this.cards = args.cards;
    this.scene = args.scene;
    this.pointer = args.pointer;
    this.textures = args.textures;

    this.markers = [];
    this.gridMarkers = Array.from({length: Math.pow(config.markers.grid.size, 2)}, e => Array());

    // marker selects in render near pointer
    this.markersSelection = [];
    this.prevMarkersSelection = [];


    this.generateMarkers();
    this.generateMarkersGrid();
  }

  /**
   * generate markers from card data and add it
   * to three group
   */
  generateMarkers() {

    // create group
    this.group = new THREE.Group();
    this.group.name = 'Card markers';

    // generate markers
    this.cards.forEach(card => {
      console.log(card.isWorking)
      // init marker
      card.marker.init(this.textures);

      // add to group
      this.group.add(card.marker.mesh);

      // add to markers array
      this.markers.push(card.marker);

    });

    // add group to scene
    this.scene.add(this.group);
  }

  /**
   * Generate markers grid for marker picking
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
      ...m[i - 1] || [],
      ...m[i] || [],
      ...m[i - 2] || [],
      ...m[i - gSize] || [],
      ...m[i - gSize - 1] || [],
      ...m[i - gSize + 1] || [],
      ...m[i + gSize] || [],
      ...m[i + gSize - 1] || [],
      ...m[i + gSize + 1] || [],
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
  update(mouseHasClick, mouseHasMove) {
    // get pointer pos
    var pointerPos = new THREE.Vector2(this.pointer.group.position.x, this.pointer.group.position.z);
    // get pointer radius
    var pointerRadius = this.pointer.ring.geometry.parameters.outerRadius;

    // set position from grid
    var currentIndex = this.getGridCell(pointerPos);

    // If selected index in grid
    if(currentIndex <= Math.pow(this.grid.size, 2)) {

      // Get hovered cells
      this.markersSelection = this.getCellsBloc(currentIndex);

      // if selection contains markers
      if(this.markersSelection.length > 0) {


        // visible false to previous markers
        if(this.prevMarkersSelection !== this.markersSelection && this.prevMarkersSelection.length > 0) {
          for ( var i = 0; i < this.prevMarkersSelection.length; i++ ) {
            var marker = this.prevMarkersSelection[i];
            if(!config.markers.debug) {
              marker.mesh.visible = false;
            }
          }
        }

        this.hoveredMarker = null;

        // distance opacity
        for ( var i = 0; i < this.markersSelection.length; i++ ) {
          var marker = this.markersSelection[i];
          var markerPos = new THREE.Vector2(marker.mesh.position.x, marker.mesh.position.z);
          var distance  = pointerPos.distanceTo(markerPos);
          var maxDistance = 150;
          //marker.mesh.material.opacity = THREE.Math.mapLinear(distance, 0, maxDistance, 1, 0);
          if(!config.markers.debug) {
            marker.mesh.visible = true;
            marker.uniforms.opacity.value = THREE.Math.mapLinear(distance, 0, maxDistance, 1, 0);
          }

          marker.pointerDistance = pointerPos.distanceTo(markerPos);

          // marker Selection
          if(marker.pointerDistance < pointerRadius*2) {
            this.hoveredMarker = marker;
            this.dispatch("hover", {
              card: this.hoveredMarker
            })
          }
        }

        if( !this.hoveredMarker ){
          this.dispatch("hover:end", {
            card: this.hoveredMarker
          })
        }


        // set prev markers selection
        this.prevMarkersSelection = this.markersSelection;

        if(mouseHasClick && this.hoveredMarker) {
          this.dispatch("click", { card: this.hoveredMarker.card });
        }
      }
    }
  }

}

export default CardMarkersManager;
