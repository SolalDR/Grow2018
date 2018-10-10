import OBJLoader from "./../helpers/OBJLoader.js";
import JSONLoader from "./../helpers/JSONLoader.js";
// import vertexShader from "./../../glsl/map.vert";
// import fragmentShader from "./../../glsl/map.frag";
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
      {name: "sol", coords: {x: 0, y: 0}, obj_url: "/static/meshes/map/Sol.obj" },
      {name: "", coords: {x: 0, y: 0}, obj_url: "/static/meshes/map/Cote_Phare.obj" },
      {name: "", coords: {x: 0, y: 0}, obj_url: "/static/meshes/map/Centre_Ville.obj" },
      {name: "", coords: {x: 0, y: 0}, obj_url: "/static/meshes/map/Centre_Ville_Haut_Gauche.obj" },
      {name: "", coords: {x: 0, y: 0}, obj_url: "/static/meshes/map/Centre_Ville_Haut_Droite.obj" },
      {name: "", coords: {x: 0, y: 0}, obj_url: "/static/meshes/map/Bas_Ville.obj" },
      {name: "", coords: {x: 0, y: 0}, obj_url: "/static/meshes/map/Bas_Cote_Droite.obj" },
      {name: "", coords: {x: 0, y: 0}, obj_url: "/static/meshes/map/Au_Dessus_Riviere.obj" }
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

    this.floor.position.set(-100, 0, -1700);
    this.floor.name = "floor";
    this.scene.add(this.floor);
  }


  /**
   * Load a tile and add it to mesh
   */
  loadTileOBJ(tile){
    var loader = new OBJLoader();
    var textureLoader = new THREE.TextureLoader();
    loader.load(
      tile.obj_url,
      ( object ) => {
        var material = new THREE.MeshPhongMaterial({
          emissive: new THREE.Color(config.colors.mapBuildingEmissive),
          color: new THREE.Color(config.colors.mapBuilding)
        });

        // material = new THREE.ShaderMaterial({
        //   vertexShader: vertexShader,
        //   fragmentShader: fragmentShader
        // })

        var geometry = object.children[0].geometry;
        var mesh = new THREE.Mesh(geometry, material);
        mesh.scale.y = 3;

        mesh.frustrumCulled = true;
        mesh.position.x += 1300;
        mesh.position.z -= 1200;

        mesh.geometry.verticesNeedUpdate = true;
        mesh.name = tile.name

        if( tile.map ){
          textureLoader.load(
            tile.map,
            (texture) => {
              mesh.material.map = texture;
            }
          );
        }


        this.tiles.push({mesh: mesh, coords: tile.coords})

        this.scene.add( mesh );
      }
    );
  }
}


export default Map;
