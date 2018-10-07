import Animation from "./Animation.js"
import Event from "./Event.js";

class CustomControl extends Event {

  constructor( camera, {
    speed = 1,
    ease = 0.2,
    boundaries = null,
    minAngle = 20,
    maxAngle = 80,
    mouse = null
  } = {} ){
    super();
    this.eventsList = ["startMovement", "endMovement"]
    this.camera = camera;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = speed;
    this.ease = ease;
    this.boundaries = boundaries;
    this.mouse = mouse;

    this.rotation = {
      min: - THREE.Math.degToRad(minAngle) - Math.PI/2,
      max: - THREE.Math.degToRad(maxAngle) - Math.PI/2
    }

    var vector = camera.getWorldDirection();
    var theta = Math.atan2(vector.x,vector.z);

    this.movement = {
      active: false,
      animation: null,
      curve: null
    }

    this.drag = {
      active: false,
      current: {
        speed: {x: 0, y: 0},
        distance: {x: 0, y: 0},
        clientX: null,
        clientY: null
      },
      origin: {
        event: null,
        phi: 0,
        theta: 0,
        clientX: null,
        clientY: null
      }
    }

    var target = this.camera.getWorldDirection();

    this.theta = Math.atan2(target.x, target.z)
    this.updatePhi();
    this.updateTarget();

    window.addEventListener("mousewheel", this.onMouseWheel.bind(this));
    window.addEventListener("DOMMouseScroll", this.onMouseWheel.bind(this));
    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  set minRotation(value){
    this.rotation.min = - THREE.Math.degToRad(value) - Math.PI/2;
  }

  set maxRotation(value){
    this.rotation.mac = - THREE.Math.degToRad(value) - Math.PI/2;
  }

  get target() {
    return new THREE.Vector3(0, 0, -1)
      .applyQuaternion(this.camera.quaternion)
      .add(this.camera.position);
  }

  set target(vector){
    this.camera.lookAt(vector);
  }


  updateTarget(){
    var phi = this.phi + this.mouse.y/50;
    var theta = this.theta + this.mouse.x/50;

    var targetPosition = new THREE.Vector3();
    targetPosition.x = this.camera.position.x + 100 * Math.sin( phi ) * Math.cos( theta );
    targetPosition.y = this.camera.position.y + 100 * Math.cos( phi );
    targetPosition.z = this.camera.position.z + 100 * Math.sin( phi ) * Math.sin( theta );
    this.target = targetPosition;
  }

  updatePhi(){
    this.phi = THREE.Math.mapLinear(
      this.camera.position.y,
      this.boundaries.min.y,
      this.boundaries.max.y,
      this.rotation.min,
      this.rotation.max
    );
  }

  generatePathHelper(curve, color = 0xFF0000, precision = 50){
    var points = curve.getPoints(precision);
    var material = new THREE.LineBasicMaterial({color: color});
    var geometry = new THREE.Geometry();
    geometry.setFromPoints( points );
    return new THREE.Line( geometry, material );
  }



  generatePath(target = new THREE.Vector3(), {
    from = this.camera.position,
    debugDirectCurve = false,
    debugFinalCurve = false,
    scene = null,
    linear = false
  } = {}) {
    var distance = target.distanceTo(from);
    var yDelta = distance*0.1;
    var nbPoints = Math.floor(distance/10);

    var directCurve = new THREE.LineCurve3( from.clone(), target.clone() );
    if( linear ) return directCurve;

    var intermediatesPoints = [];
    var advancement = 0, position = new THREE.Vector3();
    for(var i=0; i<nbPoints; i++){
      advancement = i/nbPoints;
      directCurve.getPoint(advancement, position);
      position.y += Math.sin(advancement*Math.PI)*yDelta;
      intermediatesPoints.push(new THREE.Vector3().copy(position));
    }

    var finalCurve = new THREE.CatmullRomCurve3([from].concat(intermediatesPoints).concat([target]));

    if( debugDirectCurve && scene ){
      var line = this.generatePathHelper(directCurve);
      scene.add(line)
    }

    if( debugFinalCurve && scene ){
      var line = this.generatePathHelper(finalCurve);
      scene.add(line)
    }

    return finalCurve;
  }


  move(target){
    var curve = this.generatePath(target, { linear: true });
    this.movement.animation = new Animation({
      timingFunction: "easeInOutQuad",
      from: 0,
      to: curve.getLength(),
      speed: 2,
      onFinish: ()=>{
        this.movement.active = false;
      },
      onProgress: (advancement, value)=> {
        curve.getPoint(advancement, this.camera.position);
      }
    });
    this.movement.curve = curve;
    this.movement.active = true;
  }


  update( mouseHasChange, delta ){

    if( this.movement.active ) this.movement.animation.render(delta);

    if( mouseHasChange && !this.movement.active ){
      this.needUpdateRotation = true
    }


    // Drag control
    if( this.drag.active ){
      if( this.movement.active ) this.movement.animation.stop();
      var thetaDelta = (this.drag.origin.clientX - this.mouse.x);
      this.theta = this.drag.origin.theta + thetaDelta*this.speed
      this.needUpdateRotation = true;
    }

    // Scroll control
    if( this.velocity.y !== 0 ){
      if( this.movement.active ) this.movement.animation.stop();
      if( Math.abs(this.velocity.y) < 0.0001 ) 
        this.velocity.y = 0
      else
        this.velocity.y += (0 - this.velocity.y) * 0.1
      this.camera.position.y += this.velocity.y;

      this.needUpdateRotation = true;
    }

    // Boundaries Y
    if( this.camera.position.y < this.boundaries.min.y ) {
      this.camera.position.y = this.boundaries.min.y;
    } else if(this.camera.position.y > this.boundaries.max.y) {
      this.camera.position.y = this.boundaries.max.y;
    }

    // Boundaries X & Z
    if( this.camera.position.distanceTo( new THREE.Vector3() ) > 1000 ){
      var position = new THREE.Vector3().copy(this.camera.position).normalize().multiplyScalar(1000)
      this.camera.position.set(position.x, position.y, position.z)
    }


    // Apply rotations
    if( this.needUpdateRotation ){
      this.updatePhi();
      this.updateTarget();
    }


    this.needUpdateRotation = false;
  }


  // ----------------------------------


  onMouseWheel( event ){
    this.velocity.y = event.deltaY/10;
  }

  onMouseClick( intersect ){
    var target = intersect.point;
    target.y = this.camera.position.y;

    if( target.distanceTo(this.camera.position) > this.camera.far ) return;

    this.move(target);
  }

  onMouseDown( event ) {
    this.drag.origin = {
      phi: this.phi,
      theta: this.theta,
      clientX: this.mouse.x,
      clientY: this.mouse.y
    }
    this.drag.active = true;
  }

  onMouseUp() {
    this.drag.active = false;
    this.drag.current.clientX = null;
    this.drag.current.clientY = null;
  }
}


export default CustomControl;
