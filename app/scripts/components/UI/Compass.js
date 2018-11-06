import Event from "./../../helpers/Event.js";

class Compass extends Event {
  constructor(element, camera) {
    super();
    this.camera = camera;
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.initElements(element)
    this.initEvents();
  }

  get hidden() {
    return this.element.classList.contains('compass--hidden');
  }

  set hidden(v) {
    this.element.classList[v ? 'add' : 'remove']('compass--hidden');
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

  get targetCard(){
    return this._card;
  }

  set targetCard(v){
    this._card = v;
    this.targetPosition = this._card.marker.mesh.position;
  }

  get northDirection() {
    return this.constructor.northDirection;
  }

  get lookingDirection() {
    return new THREE.Vector3(0, 0, -1)
      .applyEuler(this.camera.rotation, this.camera.rotation.order)
      .setY(0);
  }

  get targetDirection() {
    return this.targetPosition
      .clone()
      .sub(this.camera.position)
      .setY(0);
  }

  generateElements(){
    var count = 21, element;
    for(var i=0; i<count; i++){
      element = document.createElement("span");
      element.classList.add("compass__scale");
      element.style.left = i*(100/(count-1))+"%"
      this.elements.scaleContainer.appendChild(element);
      this.elements.scales[i] = element;
    }
  }

  initElements(element) {
    this.element = element;
    this.elements = {
      range: this.element.querySelector('.compass__range'),
      north: this.element.querySelector('.compass__indicator--north'),
      target: this.element.querySelector('.compass__indicator--target'),
      scaleContainer: this.element.querySelector(".compass__scale-container"),
      scales: []
    };
    this.generateElements();
  }

  initEvents() {
    window.addEventListener('resize', () => this.update());
  }

  update() {
    var lookingDirection = this.lookingDirection;

    this.north = -this.constructor.angle(lookingDirection, this.northDirection)/Math.PI;
    this.target = -this.constructor.angle(lookingDirection, this.targetDirection)/Math.PI;
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

Compass.northDirection = new THREE.Vector3(-1, 0, 0);

export default Compass;
