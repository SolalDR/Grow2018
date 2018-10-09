import Animation from "./Animation.js"
import Event from "./Event.js";

class CustomControl extends Event {

  constructor( camera, {
    speed = 1,
    ease = 0.2,
    boundaries = null,
    minAngle = 20,
    maxAngle = 80,
    mouse = null,
    phi = null,
    theta = null
  } = {} ){
    super();
    this.eventsList = ["startMovement", "endMovement"]
    this.camera = camera;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = speed;
    this.ease = ease;
    this.boundaries = boundaries;
    this.mouse = mouse;
    this.enabled = true;

    this.rotation = {
      min: - THREE.Math.degToRad(minAngle) - Math.PI/2,
      max: - THREE.Math.degToRad(maxAngle) - Math.PI/2,
      animation: null
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
      current: { speed: {x: 0, y: 0}, distance: {x: 0, y: 0}, clientX: null, clientY: null },
      origin: { phi: 0, theta: 0, clientX: null, clientY: null }
    }

    var target = this.camera.getWorldDirection();
    this.theta = theta !== null ? theta : Math.atan2(target.x, target.z);
    this.phi = phi !== null ? phi: this.computedPhi();
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

  computedPhi(height = this.camera.position.y) {
    return THREE.Math.mapLinear(
      height,
      this.boundaries.min.y,
      this.boundaries.max.y,
      this.rotation.min,
      this.rotation.max
    );
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


  move({
    target = null,
    speed = 2,
    duration = null,
    onFinish = null
  } = {}){
    var curve = this.generatePath(target, { linear: true });

    if( this.movement.animation ) {
      this.movement.animation.stop();
      this.movement.animation = null;
    }

    if( duration ){
      speed = null;
    }

    this.movement.animation = new Animation({
      timingFunction: "easeInOutQuad",
      from: 0,
      to: curve.getLength(),
      speed: speed,
      duration: duration,
      onFinish: ()=>{
        this.movement.active = false;
        if( onFinish ) onFinish();
      },
      onProgress: (advancement, value)=> {
        var position = curve.getPoint(advancement, this.camera.position);
        this.camera.position.set(position.x, position.y, position.z);
      }
    });
    this.movement.curve = curve;
    this.movement.active = true;
  }

  rotate({
    phi = this.phi,
    theta = this.theta,
    duration = null,
    speed = 0.02,
    onFinish = null
  } = {}){

    var phiStored = this.phi;
    var thetaStored = this.theta;

    if( this.rotation.animation ) {
      this.rotation.animation.stop();
      this.rotation.animation = null;
    }

    if( duration ){
      speed = null
    }

    this.rotation.animation = new Animation({
      timingFunction: "easeInOutQuad",
      from: 0,
      to: 1,
      speed: speed,
      duration: duration,
      onFinish: ()=>{
        this.rotation.animation = null;
        if( onFinish ) onFinish();
      },
      onProgress: (advancement, value)=> {
        this.phi = phiStored + (phi - phiStored)*advancement;
        this.theta = thetaStored + (theta - thetaStored)*advancement;
      }
    });
  }


  update( mouseHasChange, delta ){

    if( this.movement.active ) this.movement.animation.render(delta);
    if( this.rotation.animation !== null ) {
      this.rotation.animation.render(delta);
      this.needUpdateRotation = true;
    }

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

      // Boundaries Y
      if( this.camera.position.y < this.boundaries.min.y ) {
        this.camera.position.y = this.boundaries.min.y;
      } else if(this.camera.position.y > this.boundaries.max.y) {
        this.camera.position.y = this.boundaries.max.y;
      }

      if(this.rotation.animation === null){
        this.phi = this.computedPhi();
      }


      this.needUpdateRotation = true;
    }

    // Apply rotations
    if( this.needUpdateRotation ){
      this.updateTarget();
    }

    this.needUpdateRotation = false;
  }


  // ----------------------------------


  onMouseWheel( event ){
    if(!this.enabled) return;
    this.velocity.y = event.deltaY/10;
  }

  onMouseClick( intersect ){
    if( !this.enabled ) return;
    var target = intersect.point;
    target.y = this.camera.position.y;

    if( target.distanceTo(this.camera.position) > this.camera.far ) return;

    this.move({target: target});
  }

  onMouseDown( event ) {
    if( !this.enabled ) return;
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
