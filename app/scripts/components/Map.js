import OBJLoader from "./../helpers/OBJLoader.js";

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
      {coords: {x: 0, y: 0}, url: "/static/meshes/Haut_Gauche.obj" },
      {coords: {x: 1, y: 0}, url: "/static/meshes/Haut_Droit.obj" },
      {coords: {x: 0, y: 1}, url: "/static/meshes/Bas_Gauche.obj" },
      {coords: {x: 1, y: 1}, url: "/static/meshes/Bas_Droit.obj" }
    ];

    this.tiles = [];
    this.scene = scene;
    this.datas.forEach(data => {
      this.loadTile(data);
    })
  }


  /**
   * Load a tile and add it to mesh
   * @param  {Object} tile
   */
  loadTile(tile){
    var loader = new OBJLoader();
    loader.load(
      tile.url,
      ( object ) => {
        object.children.forEach(child=>{
          child.geometry.computeFaceNormals();
          child.geometry.computeVertexNormals();
          // child.material.wireframe = true
          child.a
        })
        this.tiles.push({mesh: object, coords: tile.coords})
        object.position.x = tile.coords.x * 1100
        object.position.z = tile.coords.y * 1000
        object.scale.y = 2
        console.log(object)
        this.scene.add( object );
      }
    );
  }

}

export default Map;
