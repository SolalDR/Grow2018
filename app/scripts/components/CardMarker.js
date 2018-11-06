import config from "./../config.js";
import refMarkersDatas from "./../../datas/refMarkers.json";
import vertexShader from "./../../glsl/cardMarker.vert";
import fragmentShader from "./../../glsl/cardMarker.frag";
import BufferGeometryUtils from "../helpers/BufferGeometryUtils";
import Animation from "../helpers/Animation";

/**
 * Card Marker object on map
 */
class CardMarker {

  /**
   * @constructor
   * @param  {Object} Logic model of the card
   * @attribute  {Object} card
   */
	constructor(card) {
		this.card = card;
		this.refMarkersDatas = refMarkersDatas;
		this.debug = config.markers.debug;
    this.startOpacity = this.debug ? 1.0 :  0.0;
    this.pointerDistance = null;
    this.active = false;

    this.fadingAway = {
      active: false,
      animation: null
    }
	}

  /**
   * init marker
   * @param textures - recto verso textures
   */
	init(textures) {
	  this.generateMesh(textures);
	  if(this.card.position) {
	    this.setPosition();
    } else {
      this.setPositionCoords();
    }
  }

  // TODO : refacto split for material, geometry and mesh
  /**
   * Generate marker
   * @param textures {Object}, sprite textures recto, verso for card
   */
  generateMesh(textures) {

    // Generate instance geometry
    var rectoGeometry = new THREE.PlaneBufferGeometry( 40, 40/config.cards.ratio, 1, 1);
    var versoGeometry = new THREE.PlaneBufferGeometry( 40, 40/config.cards.ratio, 1, 1);
    versoGeometry.rotateY(Math.PI);
    versoGeometry.computeVertexNormals();

    // Create a geomatry with both sides merged
    var geometry =  BufferGeometryUtils.merge([rectoGeometry, versoGeometry]);

    // Setup uniforms
    this.uniforms = {
      img_recto: {type: "t", value: textures.recto },
      img_verso: {type: "t", value: textures.verso },
      coords: { type: 'v2', value: this.card.coords },
      opacity: { type: 'f', value: this.startOpacity},
    };

    // Shader Material
    var material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      alphaTest: true
    });

    // Mesh
    this.mesh = new THREE.Mesh(geometry, material);
    //this.mesh.doubleSided = true;

    // set position
    this.mesh.position.y = config.markers.elevation;

    // Invert 
    this.mesh.rotation.z = Math.PI;
    //this.mesh.rotation.x = 0.6;

    // set data
    this.mesh.name = (this.card.rank + 2) + ' - marker - ' + this.card.title;
    this.mesh.meta = {
      title: this.card.title
    };

    // render false
    if(!this.debug) {
      this.mesh.visible = false;
    }
  }

  setRotation() {
    if(this.card.rotation) {
      this.mesh.rotation.set(this.card.rotation);
    }
  }

  setPosition() {
    if(this.card.position) {
      this.mesh.position.set(this.card.position);
    }
  }

  fadeAway({
    duration = null,
    onFinish = null
  } = {}){
    this.fadingAway.active = true;

    if( this.fadingAway.animation ) {
      this.fadingAway.animation.stop();
      this.fadingAway.animation = null;
    }

    this.fadingAway.animation = new Animation({
      timingFunction: "easeInQuint",
      from: this.mesh.position.y,
      to: 600,
      duration: duration,
      onFinish: ()=>{
        this.fadingAway.animation = null;
        this.mesh.visible = false;
        if( onFinish ) onFinish();
      },
      onProgress: (advancement, value)=> {
        this.mesh.position.y = value;
        this.mesh.rotation.z = Math.PI + advancement*2;
        this.uniforms.opacity.value  = 1 - advancement;
      }
    });
  }

  /**
   * Set x, y position from gps coordinates
   */
  setPositionCoords() {

    // map from latitude to x
    this.mesh.position.x = THREE.Math.mapLinear(
      this.card.gpsCoords.latitude,
      this.refMarkersDatas.bottomRight.coords.latitude,
      this.refMarkersDatas.topLeft.coords.latitude,
      config.markers.refs.bottomRight.x,
      config.markers.refs.topLeft.x
    );

    // map from longitude to z
    this.mesh.position.z = THREE.Math.mapLinear(
      this.card.gpsCoords.longitude,
      this.refMarkersDatas.bottomRight.coords.longitude,
      this.refMarkersDatas.topLeft.coords.longitude,
      config.markers.refs.bottomRight.z,
      config.markers.refs.topLeft.z
    );

    if(config.markers.debug) {
      this.setDebugCardPos();
    }
  }

  /**
   * render in THREE js raf
   * @param delta {Number} - time
   */
  render(delta) {
    if (this.fadingAway.animation !== null && !this.fadingAway.animation.ended) {
      this.fadingAway.animation.render(delta);
    }
  }


  // TODO: temp method
  /**
   * make first card in front of camera on intro for debug
   */
  setDebugCardPos() {
    if(this.card.rank === 1) {
      this.mesh.position.set(200, 80, 15);
      this.mesh.rotation.set(Math.PI, Math.PI/3, 0);
    }
  }
}


export default CardMarker;
