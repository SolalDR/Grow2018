/**
 * @class Represent vegetation
 */
class Forest {

  /**
   * @constructor
   */
  constructor({
    map = null,
    sides = 2,
    size = 2,
    density = 0.1
  }){
    this.map = map;
    this.sides = sides;
    this.size = size;
    this.density = density;
    this.texture = new THREE.TextureLoader().load( "/static/images/bird.jpg" );
    this.generateGeometry();
    this.generateMaterial();
  }

  /**
   * @returns THREE.BufferGeometry
   */
  generateInstanceGeometry(){
    var stepAngle = Math.PI/this.sides
    var geometries = [], geometry;

    for(var i=0; i<this.sides; i++){
      geometry = new THREE.PlaneBufferGeometry(this.size, this.size, 1, 1);
      geometry.rotateY(stepAngle);
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
    var trees = [];
    return trees;
  }

  /**
   * Generate geometry based on trees data & instanced geometry
   */
  generateGeometry(){
    var geometry = this.generateInstanceGeometry();
    var trees = this.generateTrees();


    var translation = new Float32Array( trees.length * 3 );
    var rotation = new Float32Array( trees.length * 4 );

    var q = new THREE.Quaternion();

    for(let i = 0; i < this.count; i++) {
      translation[ i*3 ] = ( Math.random() - .5 )*2*this.diff.x + this.center.x
      translation[ i*3 + 1 ] = ( Math.random() - .5 ) * 100;
      translation[ i*3 + 2 ] = ( Math.random() - .5 )*2*this.diff.z + this.center.z

      rotation[ i*4 ] = 0;
      rotation[ i*4 + 1 ] = 0;
      rotation[ i*4 + 2 ] = 0;
      rotation[ i*4 + 3 ] = 1;

      q.set(  ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, Math.random() * Math.PI );
      q.normalize();
    }

    this.geometry.addAttribute( 'translation', new THREE.InstancedBufferAttribute( translation, 3, false, 1 ) );
    this.geometry.addAttribute( 'rotation', new THREE.InstancedBufferAttribute( rotation, 4, false, 1 ) );
  }

  generateMaterial(){
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      uniforms: {
        u_map: { type: "t", value: this.texture }
      }
    })
  }

}
