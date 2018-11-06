import Animation from "./Animation.js"
import Event from "./Event.js";
import config from "../config.js";

class CustomControl extends Event {

  constructor( camera, {
    soundManager = null,
    speed = 1,
    ease = 0.2,
    boundaries = null,
    minAngle = 25,
    maxAngle = 85,
    mouse = null,
    phi = null,
    theta = null,
    scene = null
  } = {} ){

    super();
    this.eventsList = ["startMovement", "endMovement", "goBack"];
    this.camera = camera;
    this.scene = scene;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.speed = speed;
    this.ease = ease;
    this.boundaries = boundaries;
    this.mouse = mouse;
    this.enabled = true;
    this.mouseRotationEnabled = true;
    this.far = camera.far;
    this.prevCameraPos = new THREE.Vector3(0, 0, 0);
    this.prevTarget = null;
    this.goBackTriggered = false;

    this._focusState = false;

    this.rotation = {
      min: - THREE.Math.degToRad(minAngle) - Math.PI/2,
      max: - THREE.Math.degToRad(maxAngle) - Math.PI/2,
      animation: null
    }


    this.movement = {
      active: false,
      animation: null,
      curve: null
    }

    this.look = {
      active: false,
      animation: null
    }

    this.drag = {
      active: false,
      current: { speed: {x: 0, y: 0}, distance: {x: 0, y: 0}, clientX: null, clientY: null },
      origin: { phi: 0, theta: 0, clientX: null, clientY: null }
    }

    this.theta = theta !== null ? theta : this.computedTheta();
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
    this.rotation.max = - THREE.Math.degToRad(value) - Math.PI/2;
  }

  get target() {
    return new THREE.Vector3(0, 0, -1)
      .applyQuaternion(this.camera.quaternion)
      .add(this.camera.position);
  }

  set target(vector){
    this.camera.lookAt(vector);
  }

  set focusState(v) {
    this._focusState = v;
    this.enabled = !v;
    this.mouseRotationEnabled = !v;
  }

  get focusState() {
    return this._focusState;
  }

  computedTheta(direction = this.camera.getWorldDirection()){
    return Math.atan2(direction.x, direction.z);
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

  computeTarget(phi, theta){
    var targetPosition = new THREE.Vector3();
    var factor = config.control.boundaries.maximum.y/config.control.boundaries.minimum.y*10;
    targetPosition.x = this.camera.position.x + factor * Math.sin( phi ) * Math.cos( theta );
    targetPosition.y = this.camera.position.y + factor * Math.cos( phi );
    targetPosition.z = this.camera.position.z + factor * Math.sin( phi ) * Math.sin( theta );
    return targetPosition;
  }

  updateTarget(){
    var phi = this.phi + this.mouse.y/50;
    var theta = this.theta + this.mouse.x/50;
    this.target = this.computeTarget(phi, theta);
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

  lookAt({
    target = null,
    speed = null,
    duration = 1500,
    onFinish = null,
    timingFunction = "easeInOutQuad"
  } = {}){

    var onFinishCallback = onFinish !== null ? onFinish.bind(this) : null;

    if( this.look.animation ) {
      this.look.animation.stop();
      this.look.animation = null;
    }
    var distance = this.camera.position.distanceTo(target);
    var from = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(this.camera.quaternion)
      .multiplyScalar(distance)
      .add(this.camera.position)
    var to = target.clone();
    var diff = to.clone().sub(from);

    this.look.animation = new Animation({
      timingFunction: timingFunction,
      from: 0,
      to: 1,
      speed: speed,
      duration: duration,
      onFinish: ()=>{
        this.look.active = false;
        //if( onFinishCallback ) onFinishCallback();
        if( onFinish ) onFinish();
        // TODO: fix onfinish keep value from last method call
        onFinish = null;
      },
      onProgress: (advancement, value)=> {
        this.camera.lookAt( from.clone().add( diff.clone().multiplyScalar(advancement) ) );
      }
    });

    this.look.active = true;
  }

  move({
    target = null,
    speed = null,
    duration = 1500,
    onFinish = null
  } = {}){
    var curve = this.generatePath(target, { linear: true });

    if( this.movement.animation ) {
      this.movement.animation.stop();
      this.movement.animation = null;
    }

    this.movement.animation = new Animation({
      timingFunction: "easeInOutQuart",
      from: 0,
      to: curve.getLength(),
      speed: speed,
      duration: duration,
      onFinish: ()=>{
        this.movement.active = false;
        if( onFinish ) onFinish();
        // TODO: fix onfinish keep value from last method call
        onFinish = null;
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
      timingFunction: "easeInOutQuart",
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

    if( this.look.animation !== null ){ this.look.animation.render(delta); }

    if( mouseHasChange && !this.movement.active ){
      this.needUpdateRotation = true
    }

    // Drag control
    if( this.drag.active ){
      if( this.movement.active ) this.movement.animation.stop();
      if( this.look.active ) this.look.animation.stop();

      var thetaDelta = (this.drag.origin.clientX - this.mouse.x);
      this.theta = this.drag.origin.theta + thetaDelta*this.speed
      this.needUpdateRotation = true;
    }


    // Scroll control
    if( this.velocity.y !== 0 ){
      if( this.movement.active ) this.movement.animation.stop();
      if( this.look.active ) this.look.animation.stop();

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
      if(config.control.far) this.camera.far = Math.min(2000, this.camera.position.y * 1.1 + 600) ;
      if(this.scene.fog) {
        this.scene.fog.far = this.camera.far;
        this.scene.fog.near = this.camera.far - 300;
      }
      this.camera.updateProjectionMatrix();

      if(this.mouseRotationEnabled) {
        this.updateTarget();
      }
    }

    this.needUpdateRotation = false;
  }

  /**
   * Init go back event when click on focus state
   */
  initGoBackEvent() {
    if ( !(!this.goBackTriggered && this.focusState) ) return;
    this.dispatch('goBack');
    this.goBackTriggered = true;
  }


  // ----------------------------------


  onMouseWheel( event ){
    // move camera on y
    if(!this.enabled) return;
    this.velocity.y = event.deltaY/10;
  }

  onMouseClick( intersect ){
    // go back event on focus
    if(this.focusState) {
      this.initGoBackEvent();
    }

    // control
    if( !this.enabled ) return;
    var target = intersect.point;
    target.y = this.camera.position.y;
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
