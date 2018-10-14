import OBJLoader from "./../helpers/OBJLoader.js";
import JSONLoader from "./../helpers/JSONLoader.js";
import vertexShader from "./../../glsl/map.vert";
import fragmentShader from "./../../glsl/map.frag";
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


  getInfosAtCoord(){

  }

  getInfosAtPosition(vector){
    var distanceX = this.bbox.max.x - this.bbox.min.x;
    var distanceZ = this.bbox.max.z - this.bbox.min.z;
    var cloneVector = vector.clone();
    cloneVector.z += 330
    cloneVector.x -= 130

    cloneVector.sub(this.center)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2)
      .add(this.center)

    return this.getInfosAt(
      (cloneVector.x - this.bbox.min.x)/distanceX,
      1. - (cloneVector.z - this.bbox.min.z)/distanceZ
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

    // document.body.appendChild(canvas);
  }


  /**
   * Generate floor plane
   */
  generateFloor(){
    var loader = new OBJLoader();
    var textureLoader = new THREE.TextureLoader();
    loader.load("/static/meshes/map/Sol_2.obj", (object)=>{

        var geometry = object.children[0].geometry;
        // var material = new THREE.ShaderMaterial({
        //   vertexShader: vertexShader,
        //   fragmentShader: fragmentShader,
        //   uniforms: {
        //     u_map: { type: "t", value: null },
        //     u_ao: { type: "t", value: null },
        //     u_emissive: { type: "v3", value: new THREE.Color(config.colors.mapBuildingEmissive) },
        //     u_color: { type: "v3", value: new THREE.Color(config.colors.mapBuilding) },
        //   }
        // });

        var material = new THREE.MeshStandardMaterial({
          roughness: 0,
          metalness: 0,
          emissive: new THREE.Color(config.colors.mapFloorEmissive),
          color: new THREE.Color(config.colors.mapFloor)
        });

        this.floor = new THREE.Mesh(geometry, material);

        textureLoader.load("/static/images/textures/map.png", (texture)=>{
          this.generateInfosMap(texture);
          this.testLoaded();
          // material.uniforms.u_map.value = texture;
          // material.uniforms.needsUpdate = true;
          // this.floor.material.map = texture;
        });

        textureLoader.load("/static/images/textures/ao_8k.jpg", (texture)=>{
          // material.uniforms.u_ao.value = texture;
          // material.uniforms.needsUpdate = true;
          // this.floor.material.map = texture;
        });

        this.bbox = new THREE.Box3().setFromObject(this.floor);
        this.center = new THREE.Vector3();
        this.bbox.getCenter(this.center);
        this.floor.name = "floor";

        this.scene.add(this.floor);
        this.testLoaded();
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
        mesh.geometry.attributes.position.array[ j*3 + 1] += infos[2]/255*100 - 100
      }
    }

    for(var i=0; i<this.floor.geometry.attributes.position.count; i++) {
      infos = this.getInfosAtPosition(new THREE.Vector3(
        this.floor.geometry.attributes.position.array[ i*3 ],
        this.floor.geometry.attributes.position.array[ i*3 + 1],
        this.floor.geometry.attributes.position.array[ i*3 + 2]
      ));

      this.floor.geometry.attributes.position.array[i*3 + 1] += infos[2]/255*100 - 100;
    }
    this.floor.geometry.computeVertexNormals();
    this.floor.material.shading = THREE.SmoothShading;
  }

  testLoaded(){
    if( this.tiles.length == this.datas.length && this.infosMap && this.floor) {
      return true;
    }
    return false;
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

        this.tiles.push({mesh: mesh, coords: tile.coords});
        this.scene.add( mesh );

        this.testLoaded();
      }
    );
  }
}


export default Map;
