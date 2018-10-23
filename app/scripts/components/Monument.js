import OBJLoader from "../helpers/OBJLoader.js";

class Monument {
  constructor({slug, position}) {
    this.slug = slug;
    this.position = position;
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

  updateObject() {
    if(!this.object) return;
    this.object.position.x = this.position.x;
    this.object.position.y = this.position.y;
    this.object.position.z = this.position.z;
    this.object.scale.copy(this.constructor.scale);
  }

  load() {
    return new Promise((resolve, reject) => {
      this.constructor.loader.load(`/static/meshes/monuments/${this.slug}.obj`, object => {
        this.object = object;
        resolve(this);
      }, null, reject);
    });
  }
}

Monument.loader = new OBJLoader();
Monument.scale = new THREE.Vector3(0.1, 0.1, 0.1);

export default Monument;
