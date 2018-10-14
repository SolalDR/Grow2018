import OrbitControls from "./helpers/OrbitControls.js";
import FirstPersonControls from "./helpers/FirstPersonControls.js";
import CustomControl from "./helpers/CustomControl.js";
import Dat from "dat-gui";
import { Stats } from "three-stats";
import Clock from "./helpers/Clock.js";
import config from "./config.js";
import datas from "./../datas/datas.json";
import cleanDatas from "./../datas/data_sb_only.json";
import Card from "./components/Card.js";
import CardsCloud from "./components/CardsCloud.js";
import ImageUtil from "./helpers/ImageUtil.js";
import Map from "./components/Map.js";
import CloudMaterial from "./components/CloudMaterial.js";
import AppGui from "./AppGui.js";
import Bird from "./components/Bird.js";
import UI from "./components/UI.js";
import Pointer from "./components/Pointer.js";
import CardMarkersManager from "./components/CardMarkersManager";

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
    this.initControl();

    // Renderer & Scene
    this.container = document.querySelector( '#main' );
    document.body.appendChild( this.container );
    this.renderer = new THREE.WebGLRenderer( { antialias: false } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.container.appendChild( this.renderer.domElement );
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( config.colors.background );
    if(config.fog.active) this.scene.fog = new THREE.Fog( this.scene.background, config.fog.near, config.fog.far );
    this.onWindowResize();

    this.init();

    // export for three js extension
    window.scene = this.scene;
    window.THREE = THREE;
  }


  // -----------------------------------------

  /**
   * Manage different type of control
   */
  initControl(){
    switch (config.control.type ){
      case config.control.ORBIT:
        this.controls = new OrbitControls( this.camera );
        this.controls.target.copy(config.cards.position);
        this.controls.maxZoom = 50;
        this.controls.minZoom = 50;
        break;

      case config.control.CUSTOM:
        this.controls = new CustomControl(this.camera, {
          boundaries: new THREE.Box3(new THREE.Vector3(-1000, 200, -1000), new THREE.Vector3(1000, 1200, 1000)),
          mouse: this.mouse,
          phi: config.camera.phi
        });
        this.controls.enabled = false;
        break;

      case config.control.FPS:
        this.controls = new THREE.FirstPersonControls( this.camera );
        this.controls.movementSpeed = config.control.speed;
        this.controls.lookSpeed = 0.1;
        break;
    }
  }

  /**
   * Instantiate content & display
   */
  init(){
    this.ui = new UI(this);

    // Generic light
    this.directionalLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );

    this.directionalLight = new THREE.DirectionalLight( new THREE.Color(config.colors.lightDirectionnal), 0.18 );
    this.directionalLight.position.y = 1000;
    this.scene.add(this.directionalLight);

    // Point light
    this.pointerLight = new THREE.PointLight( new THREE.Color(config.colors.lightPointer), 0.2 );
    this.pointerLight.position.y = 100;
    this.scene.add(this.pointerLight);


    // this.cloud = new THREE.Mesh(new THREE.PlaneGeometry(this.camera.far, this.camera.far, 2, 2), new CloudMaterial());
    // this.cloud.rotation.x = -Math.PI/2
    // this.cloud.position.y = 200
    // CloudMaterial.generateGui("Cloud1", this.gui, this.cloud);
    // this.scene.add(this.cloud);
    this.pointer = new Pointer();
    this.scene.add(this.pointer.group);


    this.map = new Map(this.scene);
    this.generateCards();
    this.cardMarkersManager = new CardMarkersManager({
      data: cleanDatas,
      scene: this.scene
    });
    //this.generateCardsMarkers();

    // TODO: remove
    this.ui.compass.targetPosition = this.cardMarkersManager.markers[0].mesh.position;

    AppGui.init(this);

    this.ui.on("start", ()=>{
      var target = new THREE.Vector3(0, 400, 0);
      this.controls.move({
        target: target,
        duration: 5000
      });
      this.controls.rotate({
        phi: this.controls.computedPhi(target.y),
        duration: 5000,
        onFinish: ()=>{
          this.controls.enabled = true;
        }
      });

      this.cardsCloud.fall();
    });
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
    this.ui.compass.update();

    // this.cloud.material.uniforms.u_time.value = this.clock.elapsed*0.001;
    // this.cloud.material.uniforms.needsUpdate = true;

    this.cardsCloud.render(this.clock.elapsed);
    document.body.style.cursor = this.cardsCloud.pixelPicking.cardSelected ? 'pointer' : null;

    if( config.control.type == config.control.CUSTOM ){
      this.controls.update( this.mouseHasMove, this.clock.delta );
    } else if( config.control.type == config.control.FPS ){
      this.controls.update( this.clock.delta/1000 );
    }

    // click marker from cursor
    if(this.mouseHasClick) {
      var pointerPos = new THREE.Vector2(this.pointer.group.position.x, this.pointer.group.position.z);
      var pointerRadius = this.pointer.ring.geometry.parameters.outerRadius;
      for ( var i = 0; i < this.cardMarkersManager.markers.length; i++ ) {
        var marker = this.cardMarkersManager.markers[i];
        var markerPos = new THREE.Vector2(marker.mesh.position.x, marker.mesh.position.z);
        if(pointerPos.distanceTo(markerPos) < pointerRadius*2) {
          console.log('clicked on ', marker.mesh.meta.title);
          break;
        }
      }
    }

    if( this.mouseHasMove || this.mouseHasClick || (this.controls.movement && this.controls.movement.active) ){
      this.raycaster.setFromCamera( this.mouse, this.camera );
      var intersects = this.raycaster.intersectObjects( this.scene.children );
      for ( var i = 0; i < intersects.length; i++ ) {

        if( intersects[i].object.name == "marker") {
          if(this.mouseHasClick) {
            console.log(intersects[i].meta.title);
          }
          break;
        }
        
        if( intersects[i].object.name == "floor") {
          if( config.control.type == config.control.CUSTOM && this.mouseHasClick ) {
            this.controls.onMouseClick( intersects[i] );
          }

          // this.pointerLight.position.x = intersects[i].point.x
          // this.pointerLight.position.z = intersects[i].point.z
          this.pointer.move(intersects[i].point);
          break;
        }
      }
    }

    this.pointer.render(this.clock.elapsed);
    this.renderer.render( this.scene, this.camera );
    this.stats.end();
    this.mouseHasMove = false;
    this.mouseHasClick = false;
  }


  // -----------------------------------------


  updateMousePosition( event ) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    this.mouseHasMove = true;
  }

  onMouseDown( event ){
    this.pointer.click = true;
    if( config.control.type == config.control.CUSTOM ) {
      this.controls.onMouseDown(event);
    }
    this.click = Date.now();
  }

  onMouseUp( event ){
    this.pointer.click = false;
    if( config.control.type == config.control.CUSTOM ) {
      this.controls.onMouseDown(event);
    }
    if( Date.now() - this.click < 200 ) {
      this.mouseHasClick = true;
    }
  }


  onWindowResize() {
  	this.camera.aspect = window.innerWidth / window.innerHeight;
  	this.camera.updateProjectionMatrix();
  	this.renderer.setSize( window.innerWidth, window.innerHeight );
  }


}
