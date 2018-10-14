import Event from "./../../helpers/Event.js";

class Compass extends Event {
  constructor(element, camera) {
    super();
    this.camera = camera;
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.initElements(element)
    this.initEvents();
  }

  get width() {
    return this.elements.range.offsetWidth;
  }

  get north() {
    return this._north;
  }

  set north(v) {
    this._north = v;
    this.elements.north.style.transform = `translateX(${(v + 1)/2*this.width}px)`;
  }

  get target() {
    return this._target;
  }

  set target(v) {
    this._target = v;
    this.elements.target.style.transform = `translateX(${(v + 1)/2*this.width}px)`;
  }

  get northVector() {
    return this.constructor.northVector;
  }

  get lookingVector() {
    return new THREE.Vector3(0, 0, -1)
      .applyEuler(this.camera.rotation, this.camera.eulerOrder)
      .setY(0);
  }

  get targetVector() {
    return this.targetPosition
      .clone()
      .sub(this.camera.position)
      .setY(0);
  }

  initElements(element) {
    this.element = element;
    this.elements = {
      range: this.element.querySelector('.compass__range'),
      north: this.element.querySelector('.compass__indicator--north'),
      target: this.element.querySelector('.compass__indicator--target')
    };
  }

  initEvents() {
    window.addEventListener('resize', () => this.update());
  }

  update() {
    var lookingVector = this.lookingVector;

    this.north = -this.constructor.angle(lookingVector, this.northVector)/Math.PI;
    this.target = -this.constructor.angle(lookingVector, this.targetVector)/Math.PI;
  }

  static angle(reference, vector) {
    var angle = vector.angleTo(reference);
    if(vector.dot(new THREE.Vector3(0, 1, 0).cross(reference)) < 0) angle *= -1;
    return angle;
  }

  static init(app) {
    return new this(document.querySelector('.compass'), app.camera);
  }
}

Compass.northVector = new THREE.Vector3(-1, 0, 0);

export default Compass;
