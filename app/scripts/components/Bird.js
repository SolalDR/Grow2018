class Bird {

  constructor(){
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(-3, 0, 0),
      new THREE.Vector3(3, 0, 0)
    );

    var top = new THREE.Vector3(0, 1, 0);
    var bottom = new THREE.Vector3(0, -1, 0);

    this.geometry.faces.push(
      new THREE.Face3( 0, 2, 1 ),
      new THREE.Face3( 3, 0, 1 ),
      new THREE.Face3( 1, 2, 0 ),
      new THREE.Face3( 1, 0, 3 )
    );

    this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshStandardMaterial());
  }

  render(time){
    this.geometry.vertices[2].y = Math.cos(time*0.005);
    this.geometry.vertices[3].y = Math.cos(time*0.005);
    this.geometry.verticesNeedUpdate = true;
  }

}

export default Bird;
