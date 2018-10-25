import BufferGeometryUtils from "./../helpers/BufferGeometryUtils.js";
import vertexShader from "./../../glsl/forest.vert";
import fragmentShader from "./../../glsl/forest.frag";
import config from "./../config.js";
import OBJLoader from "./../helpers/OBJLoader.js";
import Event from "./../helpers/Event.js";


/**
 * @class Represent vegetation
 */
class Forest extends Event {

  /**
   * @constructor
   */
  constructor({
    map = null,
    sides = 2,
    size = 50,
    density = 0.001
  }){
    super();
    this.eventsList = ["load"];
    this.map = map;
    this.sides = sides;
    this.size = size;
    this.density = density;
    this.loadObject();
  }

  loadObject(){
    var loader = new OBJLoader();
    loader.load("/static/meshes/tree.obj", (mesh)=>{
      this.tree = mesh.children[0].geometry;
      this.generateGeometry();
      this.generateMaterial();
      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.mesh.position.set(0, 20, 0);
      this.mesh.frustumCulled = false;
      this.dispatch("load");
    })
  }

  /**
   * @returns THREE.BufferGeometry
   */
  generateInstanceGeometry(){
    var stepAngle = Math.PI/this.sides
    var geometries = [], geometry;

    for(var i=0; i<this.sides; i++){
      geometry = new THREE.PlaneBufferGeometry(this.size, this.size, 4, 4);
      geometry.rotateY(i*stepAngle);
      for(var j=0; j<geometry.attributes.position.count; j++) {
        geometry.attributes.position[ j*3 + 1 ] -= this.size/2 ;
      }
      geometries.push(geometry);
    }

    return BufferGeometryUtils.merge(geometries);
  }

  /**
   * Generate Trees logic
   */
  generateTrees(){
    var count = Math.floor(this.map.diff.x*this.map.diff.z*this.density);
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var trees = [], position, infos;
    for(var i=0; i<count; i++){
      position = new THREE.Vector3(
        Math.random()*this.map.diff.x + this.map.bbox.min.x,
        0,
        Math.random()*this.map.diff.z + this.map.bbox.min.z
      );

      infos = this.map.getInfosAtPosition(position);
      position.y += infos[2]/255*config.heightmap.ratio - config.heightmap.ratio;

      if( infos[1] > 10 ){
        trees.push([position.clone(), infos]);
      }

    }
    return trees;
  }

  /**
   * Generate geometry based on trees data & instanced geometry
   */
  generateGeometry(){
    // var geometry = this.generateInstanceGeometry();
    console.log(this.tree);
    var geometry = this.tree;
    var trees = this.generateTrees();

    this.geometry = new THREE.InstancedBufferGeometry().copy(geometry);
    var translation = new Float32Array( trees.length * 3 );
    var rotation = new Float32Array( trees.length * 4 );
    var scale = new Float32Array( trees.length * 3 );
    var color = new Float32Array( trees.length * 3 );

    var q = new THREE.Quaternion();

    for(let i = 0; i < trees.length; i++) {
      translation[ i*3 ] = trees[i][0].x
      translation[ i*3 + 1 ] = trees[i][0].y
      translation[ i*3 + 2 ] = trees[i][0].z

      rotation[ i*4 ] = 0;
      rotation[ i*4 + 1 ] = 0;
      rotation[ i*4 + 2 ] = 0;
      rotation[ i*4 + 3 ] = 1;

      scale[ i*3 ] = 0.08;
      scale[ i*3 + 1 ] = 0.08;
      scale[ i*3 + 2 ] = 0.08;

      color[ i*3 ] = trees[i][1][0];
      color[ i*3 + 1 ] = trees[i][1][1];
      color[ i*3 + 2 ] = trees[i][1][2];

      q.set(  ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, Math.random() * Math.PI );
      q.normalize();
    }

    this.geometry.addAttribute( 'color', new THREE.InstancedBufferAttribute( color, 3, false, 1 ) );
    this.geometry.addAttribute( 'translation', new THREE.InstancedBufferAttribute( translation, 3, false, 1 ) );
    this.geometry.addAttribute( 'rotation', new THREE.InstancedBufferAttribute( rotation, 4, false, 1 ) );
    this.geometry.addAttribute( 'scale', new THREE.InstancedBufferAttribute( scale, 3, false, 1 ) );

  }

  generateMaterial(){
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      fog: true,
      uniforms: {
        fogColor: {type: "v3", value: new THREE.Color(config.colors.background) },
        fogNear: {type: "f", value: config.fog.near },
        fogFar: {type: "f", value: config.fog.far }
      }
    })
  }

}

export default Forest;
