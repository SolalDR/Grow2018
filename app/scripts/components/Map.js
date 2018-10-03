import OBJLoader from "./../helpers/OBJLoader.js";
import JSONLoader from "./../helpers/JSONLoader.js";

/**
 * The city map
 */
class Map {

  /**
   * @attribute {Array} tiles
   * @param {THREE.Scene} scene The three.js scene
   */
  constructor(scene){
    this.datas = [
      {coords: {x: 0, y: 0}, url: "/static/meshes/export_32.obj" }
    ];

    this.tiles = [];
    this.scene = scene;
    this.datas.forEach(data => {
      this.loadTileOBJ(data);
      // this.loadTileJSON(data);
    })

    this.generateFloor();
  }

  loadTileJSON(tile){
    var loader = new JSONLoader();
    loader.load(
      tile.url,
      ( geometry ) => {
        var material = new THREE.MeshPhongMaterial();
        var material = new THREE.MeshNormalMaterial();
        var object = new THREE.Mesh(geometry, material);
        this.scene.add( object );
      }
    );
  }


  /**
   * Load a tile and add it to mesh
   * @param  {Object} tile
   */
  loadTileOBJ(tile){
    var loader = new OBJLoader();
    loader.load(
      tile.url,
      ( object ) => {
        var material = new THREE.MeshStandardMaterial({
          roughness: 0,
          metalness: 0,
          emissive: 0xAAAAAA,
          color: 0xFFFFFF
        });
        var geometry = object.children[0].geometry;
        var mesh = new THREE.Mesh(geometry, material);
        this.tiles.push({mesh: mesh, coords: tile.coords})

        console.log(mesh);
        this.scene.add( mesh );
      }
    );
  }


  generateFloor(){
    var geometry = new THREE.PlaneGeometry(2000, 1000, 2, 2);
    var material = new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 0,
      emissive: 0xAAAAAA,
      color: 0xFFFFFF
    });
    this.floor = new THREE.Mesh(geometry, material);
    this.floor.rotation.x = -Math.PI/2;
    this.floor.position.y = -20;
    this.scene.add(this.floor);
  }

}

export default Map;
