/**
 * A spatializer class to bind volume with sound
 */
export default class Spatializer {

  /**
   * @constructor
   * @param {SoundController} controller The sound controller
   * @param {THREE.Camera} camera THREE.js camera
   * @param {integer} distance Distance maximum to hear sound
   */
  constructor({ controller = null,  camera = null, distance = 100 } = {}){
    this.controller = controller;
    this.camera = camera;
    this.distance = distance;
    this.constraints = [];
  }

  addConstraint(constraint){
    this.constraints.push(constraint)
  }

  /**
   * @todo
   */
  removeConstraint(){}

  /**
   * Add a constraint which change volume based on position
   * @param {string} name Name of sound constrained
   * @param {THREE.Vector3} factor A vector which is multiply with camera (usefull to restrain axes)
   * @param {THREE.Vector3} position The emitter position
   * @param {Array(2)} values First parameter is the distance where volume equals 0, second parameter is the distance where volume equals 1
   * @param {float} volume Volume factor
   * @returns {Function}
   */
  addDistanceConstraint({
    name = null,
    factor = new THREE.Vector3(1, 1, 1),
    position = new THREE.Vector3(),
    values = [1, 0],
    volume = 1
  } = {}){
    var volumeStore;

    const emitterPosition = position
    const sound = this.controller.getSound(name);

    const constraint = f => {
      const receptorPosition = this.camera.position.clone().multiply(factor);
      const distance = receptorPosition.distanceTo(emitterPosition);
      const volumeComputed = volume*THREE.Math.clamp(
        THREE.Math.mapLinear(distance, values[0], values[1], 0, this.distance)/this.distance, 0, 1
      );

      if( volumeComputed !== volumeStore ){
        volumeStore = volumeComputed;
        sound.volume(volumeComputed);
      }
    };

    this.addConstraint(constraint);

    return constraint;
  }

  /**
   * RAF, execute each constraint
   * @returns void
   */
  render(){
    this.constraints.forEach(constraint => constraint());
  }
}
