import OBJLoader from "./../helpers/OBJLoader.js";
import JSONLoader from "./../helpers/JSONLoader.js";
import config from "./../config.js";
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
      {coords: {x: 0, y: 0}, url: "/static/meshes/map/Cote_Phare.obj" },
      {coords: {x: 0, y: 0}, url: "/static/meshes/map/Centre_Ville.obj" },
      {coords: {x: 0, y: 0}, url: "/static/meshes/map/Centre_Ville_Haut_Gauche.obj" },
      {coords: {x: 0, y: 0}, url: "/static/meshes/map/Centre_Ville_Haut_Droite.obj" },
      {coords: {x: 0, y: 0}, url: "/static/meshes/map/Bas_Ville.obj" },
      {coords: {x: 0, y: 0}, url: "/static/meshes/map/Bas_Cote_Droite.obj" },
      {coords: {x: 0, y: 0}, url: "/static/meshes/map/Au_Dessus_Riviere.obj" }
    ];

    this.tiles = [];
    this.scene = scene;
    this.datas.forEach(data => {
      this.loadTileOBJ(data);
      // this.loadTileJSON(data);
    });

    this.generateFloor();
  }


  /**
   * Generate floor plane
   */
  generateFloor(){
    var geometry = new THREE.PlaneGeometry(8200, 11000, 2, 2);
    var material = new THREE.MeshStandardMaterial({
      roughness: 0,
      metalness: 0,
      emissive: new THREE.Color(config.colors.mapFloorEmissive),
      color: new THREE.Color(config.colors.mapFloor)
    });
    this.floor = new THREE.Mesh(geometry, material);
    this.floor.rotation.x = -Math.PI/2;

    this.floor.position.set(-100, -50, -1700);
    this.floor.name = "floor";
    this.scene.add(this.floor);
  }


  /**
   * Load a tile and add it to mesh
   */
  loadTileOBJ(tile){
    var loader = new OBJLoader();
    loader.load(
      tile.url,
      ( object ) => {
        var material = new THREE.MeshPhongMaterial({
          emissive: new THREE.Color(config.colors.mapBuildingEmissive),
          color: new THREE.Color(config.colors.mapBuilding)
        });
        var geometry = object.children[0].geometry;
        var mesh = new THREE.Mesh(geometry, material);
        mesh.scale.y = 3;

        console.log(mesh.position);
        mesh.frustrumCulled = true;
        mesh.position.x += 1300;
        mesh.position.z -= 1200;

        mesh.geometry.verticesNeedUpdate = true;
        this.tiles.push({mesh: mesh, coords: tile.coords})

        console.log(mesh);
        this.scene.add( mesh );
      }
    );
  }
}


export default Map;
