import Animation from "./Animation.js"
import Event from "./Event.js";
import config from "../config.js";

class CustomControl extends Event {

  constructor( camera, {
    boundaries = null,
    minAngle = 25,
    maxAngle = 85,
    mouse = null,
    phi = null,
    theta = null,
    scene = null
  } = {} ){

    super();
    this.eventsList = [
      "move", "move:end",
      "rotate", "rotate:end",
      "focus:ready", "focus:end", "focus:click",
      "drag:start", "drag:end", "drag:progress"
    ];

    this.camera = camera;
    this.scene = scene;
    this.scrollSpeed = 0;
    this.boundaries = boundaries;
    this.mouse = mouse;
    this.enabled = true;

    this.rotation = {
      min: - THREE.Math.degToRad(minAngle) - Math.PI/2,
      max: - THREE.Math.degToRad(maxAngle) - Math.PI/2
    }

    this._move = null;
    this._rotate = null;
    this._look = null;
    this._focus = null;

    this.drag = {
      active: false,
      current: { speed: {x: 0, y: 0}, distance: {x: 0, y: 0}, clientX: null, clientY: null },
      origin: { phi: 0, theta: 0, clientX: null, clientY: null }
    }

    var target = new THREE.Vector3();
    this.camera.getWorldDirection(target);
    var theta = Math.atan2(target.x, target.z);

    this.theta = theta !== null ? theta : Math.atan2(target.x, target.z);
    this.phi = phi !== null ? phi: this.computedPhi();
    this.target = this.computeTarget();

    window.addEventListener("wheel", this.onMouseWheel.bind(this));
    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  set minRotation(value){ this.rotation.min = - THREE.Math.degToRad(value) - Math.PI/2; }
  set maxRotation(value){ this.rotation.mac = - THREE.Math.degToRad(value) - Math.PI/2; }

  get target() {
    return new THREE.Vector3(0, 0, -1)
      .applyQuaternion(this.camera.quaternion)
      .add(this.camera.position);
  }

  set target(vector){
    this.camera.lookAt(vector);
  }


  /**
   * Compute camera rotation from it's height
   * @param {float} height
   */
  computedPhi(height = this.camera.position.y) {
    return THREE.Math.mapLinear(
      height,
      this.boundaries.min.y,
      this.boundaries.max.y,
      this.rotation.min,
      this.rotation.max
    );
  }

  /**
   * Compute camera target from phi & theta
   * @return {THREE.Vector3}
   */
  computeTarget(phi = this.phi, theta = this.theta){
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

  /**
   * Animate camera to lookAt to a certain point
   * @param {THREE.Vector3} target
   * @param {integer} duration
   */
  lookAt({ target = null, duration = 1500, onFinish = null, timingFunction = "easeInOutCubic" } = {}){
    var distance = this.camera.position.distanceTo(target);
    var from = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(this.camera.quaternion)
      .multiplyScalar(distance)
      .add(this.camera.position)

    var to = target.clone();
    var diff = to.clone().sub(from);

    if( this.scrollSpeed != 0 ) this.scrollSpeed = 0;
    this._look = new Animation({ timingFunction: timingFunction, duration: duration });
    this._look.on("end", ()=> {
      this._look = null;
    });

    if( onFinish ) {
      if( onFinish ) { console.warn("CustomControl: Use onFinish attribute in lookAt() is deprecated") }
      this._look.on("end", onFinish.bind(this));
    }

    this._look.on("progress", (event) => {
      this.target = from.clone().add(diff.clone().multiplyScalar(event.advancement));
    });

    return this._look;
  }


  /**
   * Animate camera to move to a certain point
   * @param {THREE.Vector3} target
   * @param {integer} duration
   */
  move({ target = null, duration = 1500, onFinish = null } = {}){
    var from = this.camera.position.clone();
    var to = target.clone();

    if( onFinish ) { console.warn("CustomContro: Use onFinish attribute in move() is deprecated") }

    if( this.scrollSpeed != 0 ) this.scrollSpeed = 0;
    this._move = new Animation({ timingFunction: "easeInOutCubic", duration: duration });
    this._move.on("end", () => this._move = null);
    this._move.on("end", () => this.dispatch("move:end"));

    if( onFinish) this._move.on("end", onFinish.bind(this));

    this._move.on("progress", (event)=> {
      this.camera.position.set(
        from.x + (to.x - from.x)*event.advancement,
        from.y + (to.y - from.y)*event.advancement,
        from.z + (to.z - from.z)*event.advancement
      );
    });

    this.dispatch("move", this._move);

    return this._move;
  }

  /**
   * Animate camera to rotate to a couple of angle
   * @param {float} phi
   * @param {float} theta
   * @param {integer} duration
   */
  rotate({ phi = this.phi, theta = this.theta, duration = 1500, onFinish = null } = {}){
    var phi_old = this.phi;
    var theta_old = this.theta;

    if( onFinish ) { console.warn("CustomContro: Use onFinish attribute in rotate() is deprecated") }

    if( this.scrollSpeed != 0 ) this.scrollSpeed = 0;
    this._rotate = new Animation({ timingFunction: "easeInOutQuart", duration: duration });
    this._rotate.on("end", ()=> {
      this.dispatch("rotate:end");
      this._rotate = null;
    });

    if( onFinish ) this._rotate.on("end", onFinish.bind(this));

    this._rotate.on("progress", (event) => {
      this.phi = phi_old + (phi - phi_old)*event.advancement;
      this.theta = theta_old + (theta - theta_old)*event.advancement;
    });

    this.dispatch("rotate:start", this._rotate);
    return this._rotate;
  }

  /**
   * Focus on a card
   * @param {Card} card
   */
  focus(card, cardMarkersManager){
    card.active = true;
    cardMarkersManager.activeMarker = card.marker;
    var distance = this.camera.position.distanceTo(card.marker.mesh.position);

    // Store current camera state
    var cameraState = {
      target: new THREE.Vector3(0, 0, -1)
      .applyQuaternion(this.camera.quaternion)
      .multiplyScalar(distance)
      .add(this.camera.position),
      position: this.camera.position.clone(),
      phi: this.phi,
      theta: this.theta
    }

    // Store card state
    var cardState = {
      rotation: card.marker.mesh.rotation.y
    }

    var cardNormal = new THREE.Vector3();
    var cameraDist = card.isPortrait ? config.markers.cameraFocusDist.portrait : config.markers.cameraFocusDist.landscape;
    card.marker.mesh.getWorldDirection(cardNormal);
    var positionTarget = card.marker.mesh.position.clone().add(cardNormal.multiplyScalar(-cameraDist))

    this._focus = true;
    var anim = this.move({ target: positionTarget });
    var animLook = this.lookAt({ target: card.marker.mesh.position });

    const dragProgress = (event) => {
      card.marker.mesh.rotation.y = cardState.rotation + event.delta*2.;
    };
    const dragEnd = (event) => {
      cardState.rotation = card.marker.mesh.rotation.y;
    }

    const focusClick = (event)=>{
      if( event.castActiveMarker ) return;
      this.move({ target: cameraState.position });
      var outAnim = this.lookAt({ target: cameraState.target, timingFunction: "linear" });
      outAnim.on("end", ()=>{
        this._focus = null;
        this.phi = cameraState.phi;
        this.theta = cameraState.theta;
        this.off("focus:click", focusClick);
        this.off("drag:end", dragEnd);
        this.off("drag:progress", dragProgress);
        this.dispatch("focus:end");
        console.log(this.phi, this.theta, cardState.rotation, cameraState.target, cameraState.position, cameraState.phi, cameraState.theta);
        cardMarkersManager.activeMarker.fadeAway({ duration: 1200 }).once("end", ()=>{
          cardMarkersManager.activeMarker = null;
        });
      })
    }

    anim.on("end", ()=>{
      this.dispatch("focus:ready");
      this.on("drag:progress", dragProgress);
      this.on("drag:end", dragEnd);
      this.on("focus:click", focusClick);
    })
  }

  get isFocus(){
    return this._focus === null ? false : true;
  }

  update( mouseHasChange, delta ){

    // Move & rotate anim
    if( this._move ) this._move.render(delta);
    if(this._rotate!== null) {
      this._rotate.render(delta);
      this.needUpdateRotation = true;
    }

    // Drag control
    if( this.drag.active ){
      if( this._move ) this._move = null;
      var thetaDelta = (this.drag.origin.clientX - this.mouse.x);
      this.theta = this.drag.origin.theta + thetaDelta;
      this.needUpdateRotation = true;
      this.dispatch("drag:progress", { delta: thetaDelta });

    }

    // Scroll control
    if( this.scrollSpeed !== 0 ){
      if( this._move ) this._move = null;

      if( Math.abs(this.scrollSpeed) < 0.0001 ) 
        this.scrollSpeed = 0
      else
        this.scrollSpeed += (0 - this.scrollSpeed) * 0.1
      this.camera.position.y += this.scrollSpeed;

      // Boundaries Y
      if( this.camera.position.y < this.boundaries.min.y ) {
        this.camera.position.y = this.boundaries.min.y;
      } else if(this.camera.position.y > this.boundaries.max.y) {
        this.camera.position.y = this.boundaries.max.y;
      }

      if(this._rotate === null && this._look === null){
        this.phi = this.computedPhi();
      }
    }

    // Apply rotations
    if( (mouseHasChange && !this._move) ||  this._look !== null || this.scrollSpeed !== 0){
      this.needUpdateRotation = true
    }
    if( this.needUpdateRotation ){
      if( this._look !== null ){
        this._look.render(delta);
      } else if( !this._focus ) {
        this.target = this.computeTarget();
      }
    }

    // Manage camera and fog
    if( this.needUpdateRotation || this._move ){
      if(config.control.far) this.camera.far = Math.min(2000, this.camera.position.y * 1.1 + 600) ;
      if(this.scene.fog) {
        this.scene.fog.far = this.camera.far;
        this.scene.fog.near = this.camera.far - 300;
      }
      this.camera.updateProjectionMatrix();
    }

    this.needUpdateRotation = false;
    this.hasCastActiveMarker = false;
  }


  // ----------------------------------


  onMouseWheel( event ){
    if(!this.enabled || this._focus ) return;
    this.scrollSpeed = event.deltaY/10;
  }

  onMouseClick(){
    if( !this.enabled ) return;
    if( this._focus ){
      this.dispatch("focus:click", {
        castActiveMarker: this.hasCastActiveMarker
      });
    }
  }

  onMouseCast( intersect, hasClick, isActiveMarker ){
    if( !this.enabled ) return;

    // If has cast the active marker, notice & render
    if( isActiveMarker) {
      this.hasCastActiveMarker = true;
      return;
    }

    // If has clicked on floor
    if( hasClick ){
      var target = intersect.point;
      target.y = this.camera.position.y;
      this.move({target: target});
    }
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
    this.dispatch("drag:start");
  }

  onMouseUp() {
    this.drag.active = false;
    this.drag.current.clientX = null;
    this.drag.current.clientY = null;
    this.dispatch("drag:end");
  }

  // TODO: temp
  // DEBUG METHOD
  moveToMesh(name) {
    var mesh = this.scene.getObjectByName(name);
    var target = mesh.position.clone();
    target.y = this.camera.position.y;
    this.move({target: target});
  }

}


export default CustomControl;
