import OrbitControls from "./helpers/OrbitControls.js";
import FirstPersonControls from "./helpers/FirstPersonControls.js";
import CustomControl from "./helpers/CustomControl.js";
import Dat from "dat-gui";
import { Stats } from "three-stats";
import Clock from "./helpers/Clock.js";
import config from "./config.js";
import datas from "./../datas/datas.json";
import Card from "./components/Card.js";
import CardsCloud from "./components/CardsCloud.js";
import ImageUtil from "./helpers/ImageUtil.js";
import Map from "./components/Map.js";
import CloudMaterial from "./components/CloudMaterial.js";

/**
 * Main app object
 */
export default class App {

  /**
   * @constructor
   */
  constructor() {
    window.THREE = THREE;
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    document.body.addEventListener("mousemove", this.updateMousePosition.bind(this), false);
    window.addEventListener("mousedown", this.onMouseDown.bind(this));
    window.addEventListener("mouseup", this.onMouseUp.bind(this));

    // Measure & Config
    this.config = config;
    this.gui = new Dat.GUI();
    this.clock = new Clock();
    this.stats = new Stats();
    this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( this.stats.dom );

    // Camera and control
    this.camera = new THREE.PerspectiveCamera( config.camera.fov, window.innerWidth / window.innerHeight, config.camera.near, config.camera.far );
    this.camera.position.set( config.camera.position.x, config.camera.position.y, config.camera.position.z);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();


    switch (config.control.type ){
      case config.control.ORBIT:
        this.controls = new OrbitControls( this.camera );
        this.controls.target.copy(config.cards.position);
        this.controls.maxZoom = 50;
        this.controls.minZoom = 50;
        break;

      case config.control.CUSTOM:
        this.controls = new CustomControl(this.camera, {
          boundaries: new THREE.Box3(new THREE.Vector3(-1000, 100, -1000), new THREE.Vector3(1000, 500, 1000)),
          mouse: this.mouse
        });
        break;

      case config.control.FPS:
        this.controls = new THREE.FirstPersonControls( this.camera );
        this.controls.movementSpeed = config.control.speed;
        this.controls.lookSpeed = 0.1;
        break;

    }

    // Renderer & Scene
    this.container = document.querySelector( '#main' );
    document.body.appendChild( this.container );
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.container.appendChild( this.renderer.domElement );
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( config.scene.background );
    if(config.fog.active) this.scene.fog = new THREE.Fog( config.scene.background, config.fog.near, config.fog.far );
    this.onWindowResize();

    this.init();
  }


  // -----------------------------------------


  /**
   * Instantiate content & display
   */
  init(){
    // Generic light
    var light = new THREE.DirectionalLight( 0xffffff, 0.18 );
    light.position.y = 100;
    this.scene.add(light);

    // Point light
    var pointLight = new THREE.PointLight( 0xFFFFFF, 0.4 );
    pointLight.position.y = 50;
    this.scene.add(pointLight);

    this.cloud = new THREE.Mesh(new THREE.PlaneGeometry(this.camera.far, this.camera.far, 2, 2), new CloudMaterial());
    this.cloud.rotation.x = -Math.PI/2
    this.cloud.position.y = 200
    CloudMaterial.generateGui("Cloud1", this.gui, this.cloud);

    this.scene.add(this.cloud);
    this.map = new Map(this.scene);
    this.generateCards();
  }


  generateCards() {
    var cards = [], card;
    var recto = new THREE.TextureLoader().load(
      "/static/images/img_recto.jpg",
      () => {

        // Create canvas to read pixel information based on card's coords
        var canvas = document.createElement('canvas');
        canvas.width = recto.image.width;
        canvas.height = recto.image.height;
        var ctx = canvas.getContext('2d')
        ctx.drawImage(recto.image, 0, 0, recto.image.width, recto.image.height);

        // Instantiate all the cards
        datas.forEach(data => {
          card = new Card(data);
          var coords = card.getCoordsInImage(recto.image);
          var color =  ImageUtil.getColorAt(ctx, coords.x, coords.y);
          if( card.isWorking ) cards.push(card);
        });

        this.cardsCloud = new CardsCloud({
          cards,
          gui: this.gui,
          camera: this.camera
        });

        this.scene.add(this.cardsCloud.mesh);
        this.renderer.animate( this.render.bind(this) );
      }
    );
  }


  // -----------------------------------------

  /**
   * THREE.js raf
   */
  render() {
    this.stats.begin();
    this.clock.update();

    this.cloud.material.uniforms.u_time.value = this.clock.elapsed*0.001;
    this.cloud.material.uniforms.needsUpdate = true;

    this.cardsCloud.render(this.clock.elapsed);
    document.body.style.cursor = this.cardsCloud.pixelPicking.cardSelected ? 'pointer' : null;

    if( config.control.type == config.control.CUSTOM ){
      this.controls.update( this.mouseHasChange, this.clock.delta );
    } else if( config.control.type == config.control.FPS ){
      this.controls.update( this.clock.delta/1000 );
    }

    this.renderer.render( this.scene, this.camera );
    this.stats.end();
    this.mouseHasChange = false;
  }


  // -----------------------------------------


  updateMousePosition( event ) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    this.mouseHasChange = true;
  }

  onMouseDown( event ){
    if( config.control.type == config.control.CUSTOM ) {
      this.controls.onMouseDown(event);
    }
    this.click = Date.now();
  }

  onMouseUp( event ){
    if( config.control.type == config.control.CUSTOM ) {
      this.controls.onMouseDown(event);
    }

    if( Date.now() - this.click < 200 ) {
      this.onMouseClick();
    }
  }

  onMouseClick(){
    this.raycaster.setFromCamera( this.mouse, this.camera );

    // calculate objects intersecting the picking ray
    var intersects = this.raycaster.intersectObjects( this.scene.children );
    for ( var i = 0; i < intersects.length; i++ ) {
      if( intersects[i].object.name == "floor") {
        if( config.control.type == config.control.CUSTOM ) {
          this.controls.onMouseClick( intersects[i] );
        }
        break;
      }
    }
  }


  onWindowResize() {
  	this.camera.aspect = window.innerWidth / window.innerHeight;
  	this.camera.updateProjectionMatrix();
  	this.renderer.setSize( window.innerWidth, window.innerHeight );
  }


}
