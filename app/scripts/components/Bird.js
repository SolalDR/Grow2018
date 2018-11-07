import vertexShader from "./../../glsl/bird.vert";
import fragmentShader from "./../../glsl/bird.frag";
import config from "./../config.js";

class Bird {

  static get Geometry(){
    var geometry = new THREE.Geometry();
    var top = new THREE.Vector3(0, 1, 0);
    var bottom = new THREE.Vector3(0, -1, 0);

    geometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(-3, 0, 0),
      new THREE.Vector3(3, 0, 0)
    );

    geometry.faces.push(
      new THREE.Face3( 0, 2, 1 ),
      new THREE.Face3( 3, 0, 1 ),
      new THREE.Face3( 1, 2, 0 ),
      new THREE.Face3( 1, 0, 3 )
    );

    return geometry;
  }

  constructor({
    count = 10,
    scale = 1,
    bbox = new THREE.Box3(new THREE.Vector3(-100, -100, -100), new THREE.Vector3(100, 100, 100))
  }){
    this.count = count;
    this.scale = scale;
    this.bbox = bbox;
    this.diff = this.bbox.max.clone().sub(this.bbox.min);
    this.center = new THREE.Vector3();
    this.bbox.getCenter(this.center);
    this.generateGeometry();
    this.generateMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false
  }

  generateGeometry(){
    var geo = new THREE.PlaneBufferGeometry( 6, 6, 2, 1 );
    geo.rotateX(-Math.PI/2);
    var geometryInstance = geo;
    this.geometry = new THREE.InstancedBufferGeometry().copy(geometryInstance);

    // Create empty attributes
    var translation = new Float32Array( this.count * 3 );
    var scale = new Float32Array( this.count * 3 );
    var rotation = new Float32Array( this.count * 4 );
    var offset = new Float32Array( this.count );
    var speed = new Float32Array( this.count );

    var q = new THREE.Quaternion();

    for(let i = 0; i < this.count; i++) {
      translation[ i*3 ] = ( Math.random() - .5 )*2*this.diff.x + this.center.x
      translation[ i*3 + 1 ] = ( Math.random() - .5 ) * 100;
      translation[ i*3 + 2 ] = ( Math.random() - .5 )*2*this.diff.z + this.center.z

      rotation[ i*4 ] = 0;
      rotation[ i*4 + 1 ] = 0;
      rotation[ i*4 + 2 ] = 0;
      rotation[ i*4 + 3 ] = 1;

      scale[ i*3 ] = this.scale;
      scale[ i*3 + 1 ] = this.scale;
      scale[ i*3 + 2 ] = this.scale;

      offset[i] = Math.random()*Math.PI;
      speed[i] = 6 + Math.random()*3;

      q.set(  ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, ( Math.random() - .5 ) * 2, Math.random() * Math.PI );
      q.normalize();
    }

    this.geometry.addAttribute( 'translation', new THREE.InstancedBufferAttribute( translation, 3, false, 1 ) );
    this.geometry.addAttribute( 'rotation', new THREE.InstancedBufferAttribute( rotation, 4, false, 1 ) );
    this.geometry.addAttribute( 'scale', new THREE.InstancedBufferAttribute( scale, 3, false, 1 ) );
    this.geometry.addAttribute( 'offset', new THREE.InstancedBufferAttribute( offset, 1, false, 1 ) );
    this.geometry.addAttribute( 'speed', new THREE.InstancedBufferAttribute( speed, 1, false, 1 ) );
  }

  generateMaterial(){
    var bird = new THREE.TextureLoader().load( "/static/images/bird.jpg" );
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      fog: true,
      uniforms: {
        u_time: { type: "f", value: 0 },
        u_zmin: { type: "f", value: this.bbox.min.z },
        u_zmax: { type: "f", value: this.bbox.max.z },
        u_zcenter: { type: "f", value: this.center.z },
        u_map: {type: "t", value: bird },
        fogColor: {type: "v3", value: new THREE.Color(config.colors.background) },
        fogNear: {type: "f", value: config.fog.near },
        fogFar: {type: "f", value: config.fog.far }
      },
      transparent: true
    });
  }

  render(time){
    this.material.uniforms.u_time.value = time;
    this.material.uniforms.needsUpdate = true;
  }

}

export default Bird;
