import Event from "./../helpers/Event.js";
import OBJLoader from "./../helpers/OBJLoader.js";
import DRACOLoader from "./../helpers/DRACOLoader.js";
import JSONLoader from "./../helpers/JSONLoader.js";
import vertexShader from "./../../glsl/map.vert";
import fragmentShader from "./../../glsl/map.frag";
import config from "./../config.js";
/**
 * The city map
 */
class Map extends Event {

  /**
   * @attribute {Array} tiles
   * @param {THREE.Scene} scene The three.js scene
   */
  constructor(scene, raycaster){
    super();
    this.eventsList = ["floor:load", "map:load", "load"]
    this.datas = [
      {name: "", obj_url: "01.obj.drc", map_url: "ao_4k/01-4k.jpg" },
      {name: "", obj_url: "02.obj.drc", map_url: "ao_4k/02-4k.jpg" },
      {name: "", obj_url: "03.obj.drc", map_url: "ao_4k/03-4k.jpg" },
      {name: "", obj_url: "04.obj.drc", map_url: "ao_4k/04-4k.jpg" },
      {name: "", obj_url: "05.obj.drc", map_url: "ao_4k/05-4k.jpg" },
      {name: "", obj_url: "06.obj.drc", map_url: "ao_4k/06-4k.jpg" },
      {name: "", obj_url: "07.obj.drc", map_url: "ao_4k/07-4k.jpg" },
      {name: "", obj_url: "08.obj.drc", map_url: "ao_4k/08-4k.jpg" },
    ];

    this.tiles = [];
    this.scene = scene;
    this.raycaster = raycaster;
    this.datas.forEach(data => {
      this.loadTileDRC(data);
    });

    this.generateFloor();
  }


  /**
   * @TODO
   * @param {Vector2} coords A latitude longitude object
   * @return {Object}
   */
  getInfosAtCoord(coords){}


  getInfosAtPosition(vector){
    var cloneVector = vector.clone();

    cloneVector.sub(this.center)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2)

    cloneVector.x *= this.ratioZ
    cloneVector.z *= this.ratioX

    cloneVector.add(this.center)

    return this.getInfosAt(
      (cloneVector.x - this.bbox.min.x)/this.diff.x,
      1. - (cloneVector.z - this.bbox.min.z)/this.diff.z
    );
  }

  /**
   * [getInfosAt description]
   * @param  {float} x X coord between 0 and 1
   * @param  {float} y y coord between 0 and 1
   * @return {Object} Infos at this pixel
   */
  getInfosAt(x, y){
    y = 1. - y;
    var infos = this.infosMap.context.getImageData(
      x*this.infosMap.texture.image.width,
      y*this.infosMap.texture.image.height, 1, 1);

    return infos.data;
  }


  generateInfosMap(texture){
    var canvas = document.createElement("canvas");
    canvas.width = 4096;
    canvas.height = 4096;
    canvas.id = "debug-floor"
    var ctx = canvas.getContext("2d");
    var image = texture.image;

    ctx.fillStyle = "rgb(200,0,0)";

    ctx.drawImage(texture.image, 0, 0, image.width, image.height);

    this.infosMap = {
      context: ctx,
      texture: texture
    }

  }


  /**
   * Generate floor plane
   */
  generateFloor(){
    var loader = new OBJLoader();
    var textureLoader = new THREE.TextureLoader();
    loader.load("/static/meshes/Sol.obj", (object)=>{

        var geometry = object.children[0].geometry;
        var material = new THREE.MeshPhongMaterial({
          emissive: new THREE.Color(config.colors.mapFloorEmissive),
          color: new THREE.Color(config.colors.mapFloor),
          shininess: 100
        });

        this.floor = new THREE.Mesh(geometry, material);

        textureLoader.load("/static/images/textures/map.jpg", (texture)=>{
          this.generateInfosMap(texture);

          if( config.heightmap.debug ){
            material.map = texture;
          }
          if(config.heightmap.active){
            this.computeHeightMap();
          }

          this.testLoaded();
          this.dispatch("map:load");
        });


        this.bbox = new THREE.Box3().setFromObject(this.floor);
        this.diff = this.bbox.max.clone().sub(this.bbox.min);
        this.ratioX = this.diff.z/this.diff.x;
        this.ratioZ = this.diff.x/this.diff.z;
        this.center = new THREE.Vector3();
        this.bbox.getCenter(this.center);
        this.floor.name = "floor";

        this.scene.add(this.floor);

        this.testLoaded();
        this.dispatch("floor:load");
    });
  }


  computeHeightMap(){
    var vertice = null, infos = null, mesh = null, uv = null;


    for(var i=0; i<this.tiles.length; i++){
      mesh = this.tiles[i].mesh;
      for(var j=0; j<mesh.geometry.attributes.position.count; j++){
        vertice = new THREE.Vector3(
          mesh.geometry.attributes.position.array[ j*3 ],
          mesh.geometry.attributes.position.array[ j*3 + 1],
          mesh.geometry.attributes.position.array[ j*3 + 2]
        );
        infos = this.getInfosAtPosition(vertice);
        mesh.geometry.attributes.position.array[ j*3 + 1] += infos[2]/255*config.heightmap.ratio - config.heightmap.ratio;
      }
    }

    for(var i=0; i<this.floor.geometry.attributes.position.count; i++) {
      infos = this.getInfosAtPosition(new THREE.Vector3(
        this.floor.geometry.attributes.position.array[ i*3 ],
        this.floor.geometry.attributes.position.array[ i*3 + 1],
        this.floor.geometry.attributes.position.array[ i*3 + 2]
      ));

      this.floor.geometry.attributes.position.array[i*3 + 1] += infos[2]/255*config.heightmap.ratio - config.heightmap.ratio;
    }

    this.floor.geometry.computeVertexNormals();
  }

  testLoaded(){
    if( this.tiles.length == this.datas.length && this.infosMap && this.floor) {
      this.dispatch("load");
      return true;
    }
    return false;
  }


  loadTileDRC(tile, onLoad) {
    DRACOLoader.setDecoderPath('/static/draco/');
    DRACOLoader.setDecoderConfig({type: 'js'}); // (Optional) Override detection of WASM support.

    var loader = new DRACOLoader();
    var textureLoader = new THREE.TextureLoader();
    loader.load(
      "/static/meshes/map_drc/" + tile.obj_url,
      ( geometry ) => {
        var material = new THREE.MeshPhongMaterial({
          emissive: new THREE.Color(config.colors.mapBuildingEmissive),
          color: new THREE.Color(config.colors.mapBuilding)
        });

        textureLoader.load("/static/images/textures/"+tile.map_url, (texture)=>{
          material.map = texture;
        });

        // var geometry = object.children[0].geometry;
        var mesh = new THREE.Mesh(geometry, material);
        mesh.frustrumCulled = true;
        mesh.position.y += 20;
        mesh.geometry.verticesNeedUpdate = true;
        mesh.name = tile.name;

        this.tiles.push({mesh: mesh});
        this.scene.add( mesh );

        this.testLoaded();
      }
    );
  }

  /**
   * Load a tile and add it to mesh
   */
  loadTileOBJ(tile, onLoad){
    var loader = new OBJLoader();
    var textureLoader = new THREE.TextureLoader();
    loader.load(
      tile.obj_url,
      ( object ) => {
        var material = new THREE.MeshPhongMaterial({
          emissive: new THREE.Color(config.colors.mapBuildingEmissive),
          color: new THREE.Color(config.colors.mapBuilding)
        });


        var geometry = object.children[0].geometry;
        var mesh = new THREE.Mesh(geometry, material);
        mesh.frustrumCulled = true;
        mesh.position.y += 20;
        mesh.geometry.verticesNeedUpdate = true;
        mesh.name = tile.name;

        this.tiles.push({mesh: mesh});
        this.scene.add( mesh );

        this.testLoaded();
      }
    );
  }
}


export default Map;
