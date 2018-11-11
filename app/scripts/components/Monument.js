import OBJLoader from "../helpers/OBJLoader.js";
import config from "../config.js";
import refMarkersDatas from "./../../datas/refMarkers.json";
import DRACOLoader from "./../helpers/DRACOLoader.js";


// TODO: still usefull if one obj ?
class Monument {
  constructor({slug, position, rotation, scale}) {
    this.slug = slug;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.object = null;
  }

  get object() {
    return this._object;
  }

  set object(v) {
    this._object = v;
    this.updateObject();
  }

  get position() {
    return this._position;
  }

  set position(v) {
    this._position = v;
    this.updateObject();
  }

  get scale() {
    return this._scale;
  }

  set scale(v) {
    this._scale = v;
    this.updateObject();
  }

  updateObject() {
    if(!this.object) return;
    this.object.position.copy(this.position);
    this.object.rotation.set(
      this.rotation.x,
      this.rotation.y,
      this.rotation.z
    );
    this.object.scale.set(this.scale, this.scale, this.scale);
    this.object.name = this.slug;
  }

  load(){
    return this.loadDRACOLoader();
  }

  loadTexture(resolve, reject){
    this.constructor.textureLoader.load( `/static/city/textures/buildings/${this.slug}.jpg`, (texture) => {

      this.object.material.map = texture;
      this.object.material.needsUpdate = true;

      resolve(this);
    }, resolve, reject )
  }

  loadDRACOLoader(){
    return new Promise((resolve, reject) => {
      this.constructor.loader.load(
        `/static/city/drc/buildings/${this.slug}.obj.drc`,
        ( geometry ) => {
          this.object = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
            emissive: new THREE.Color(config.colors.mapBuildingEmissive),
            color: new THREE.Color(config.colors.mapBuilding)
          }))
          this.object.name = this.slug;

          this.loadTexture(resolve, reject);
        }
      , null, reject);
    })
  }

  loadOBJLoader() {
    return new Promise((resolve, reject) => {
      this.constructor.loader.load(`/static/city/obj/buildings/${this.slug}.obj`, object => {
        this.object = object;
        this.object.name = this.slug;
        resolve(this);
      }, null, reject);
    });
  }

  // TODO: remove

  lookAtItFrom(camera, y = 150, radius = 400, speed = 0.01) {
    camera.position.y = this.position.y + y;

    var alpha = 0;
    var animationFrame;

    var update = () => {
      camera.position.x = this.position.x + Math.cos(alpha)*radius;
      camera.position.z = this.position.z + Math.sin(alpha)*radius;
      camera.lookAt(this.object.position);
      alpha += speed;

      animationFrame = requestAnimationFrame(update);
    };

    var stop = () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('mousedown', stop);
    };

    window.addEventListener('mousedown', stop);

    update();
  }

  static convert(latitude, longitude) {
    var x = THREE.Math.mapLinear(
      latitude,
      refMarkersDatas.bottomRight.coords.latitude,
      refMarkersDatas.topLeft.coords.latitude,
      config.markers.refs.bottomRight.x,
      config.markers.refs.topLeft.x
    );

    var y = THREE.Math.mapLinear(
      longitude,
      refMarkersDatas.bottomRight.coords.longitude,
      refMarkersDatas.topLeft.coords.longitude,
      config.markers.refs.bottomRight.z,
      config.markers.refs.topLeft.z
    );

    console.log(`"position": {"x": ${x}, "y": 0, "z": ${y}},`)
  }
}

DRACOLoader.setDecoderPath('/static/draco/');
DRACOLoader.setDecoderConfig({type: 'js'});
Monument.loader = new DRACOLoader();
Monument.textureLoader = new THREE.TextureLoader();


export default Monument;
