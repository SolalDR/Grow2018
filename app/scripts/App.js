import OrbitControls from "./helpers/OrbitControls.js";
import FirstPersonControls from "./helpers/FirstPersonControls.js";
import CustomControl from "./helpers/CustomControl.js";
import Dat from "dat-gui";
import Clock from "./helpers/Clock.js";
import config from "./config.js";
import monuments from "./../datas/monuments.json";
import datas from "./../datas/data_sb_only.json";
import Card from "./components/Card.js";
import CardsCloud from "./components/CardsCloud.js";
import ImageUtil from "./helpers/ImageUtil.js";
import Map from "./components/Map.js";
import CloudMaterial from "./components/CloudMaterial.js";
import AppGui from "./AppGui.js";
import Bird from "./components/Bird.js";
import Forest from "./components/Forest.js";
import UI from "./components/UI.js";
import Pointer from "./components/Pointer.js";
import Water from "./components/Water.js";
import CardMarkersManager from "./components/CardMarkersManager";
import Monument from "./components/Monument";
import Collection from "./components/Collection";
import PostProcessing from "./components/PostProcessing.js";
import promiseLoadTextures from "./helpers/PromiseLoadTextures";
import "./helpers/OBJExporter";

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

    // Camera and control
    this.camera = new THREE.PerspectiveCamera( config.camera.fov, window.innerWidth / window.innerHeight, config.camera.near, config.camera.far );
    this.camera.position.set( config.camera.position.x, config.camera.position.y, config.camera.position.z);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

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

    this.postProcessing = new PostProcessing(this.renderer);
    this.onWindowResize();

    this.container.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.container.addEventListener("mouseup", this.onMouseUp.bind(this));

    this.init();
    this.initControl();

    // export for three js extension
    window.scene = this.scene;
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
          boundaries: new THREE.Box3(
            new THREE.Vector3(
              config.control.boundaries.minimum.x,
              config.control.boundaries.minimum.y,
              config.control.boundaries.minimum.z
            ),
            new THREE.Vector3(
              config.control.boundaries.maximum.x,
              config.control.boundaries.maximum.y,
              config.control.boundaries.maximum.z
            )
          ),
          mouse: this.mouse,
          phi: config.camera.phi,
          scene: this.scene
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

    this.directionalLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    this.directionalLight = new THREE.DirectionalLight( new THREE.Color(config.colors.lightDirectionnal), 0.18 );
    this.directionalLight.position.y = 1000;
    this.pointerLight = new THREE.PointLight( new THREE.Color(config.colors.lightPointer), 0.2 );
    this.pointerLight.position.y = 100;
    this.pointer = new Pointer();

    this.map = new Map(this.scene, this.raycaster);
    this.map.on("load", ()=>{
      this.birds = new Bird({
        count: 200,
        bbox: this.map.bbox,
        scale: 4
      });
      this.birds.mesh.position.set(-40, 400, 100);

      // Forest
      this.forest = new Forest({ map: this.map })
      this.forest.on("load", ()=>{
        this.generateCards();
        this.generateMonuments();
      })
    });

    this.map.on("heightmap:ready", ()=>{
      // this.export();
    })

    this.ui.on("intro:begin", ()=>{
      var target = new THREE.Vector3(0, 200, 0);

      if(this.config.control.type === this.config.control.CUSTOM) {
        this.controls.move({ target: target, duration: 5000, onFinish: () => this.ui.dispatch("intro:end") });
        this.controls.rotate({ phi: this.controls.computedPhi(target.y), duration: 5000, onFinish: () => this.controls.enabled = true });
      }

      this.cardsCloud.fall();
    });


    AppGui.init(this);
  }

  generateCards() {
    var cards = [], card;

    promiseLoadTextures(
      [
        '/static/images/img_verso.jpg',
        '/static/images/img_recto.jpg'
      ],
      (textures) => {

        var verso = textures[0];
        var recto = textures[1];

        // Create canvas to read pixel information based on card's coords
        var canvas = document.createElement('canvas');
        canvas.width = recto.image.width;
        canvas.height = recto.image.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(recto.image, 0, 0, recto.image.width, recto.image.height);

        // Instantiate all the cards
        datas.forEach(data => {
          card = new Card(data);
          var coords = card.getCoordsInImage(recto.image);
          var color =  ImageUtil.getColorAt(ctx, coords.x, coords.y);
          if( card.isWorking ) cards.push(card);
        });

        this.cardsCloud = new CardsCloud({ cards, gui: this.gui, camera: this.camera });
        this.collection = new Collection({ ui: this.ui.collection, cards: cards });

        this.cardMarkersManager = new CardMarkersManager({
          cards,
          textures : {
            recto: recto,
            verso: verso
          },
          scene: this.scene,
          pointer: this.pointer
        });

        // set ui compass
        this.ui.compass.targetCard = this.collection.getRandomTarget();
        this.collection.on("addCard", () => this.ui.compass.targetCard = this.collection.getRandomTarget());
        this.cardMarkersManager.on("hover", () => this.pointer.hover = true );
        this.cardMarkersManager.on("hover:end", () => this.pointer.hover = false );
        this.cardMarkersManager.on("click", (event) => {
          this.focusOnCard(event);
        });

        // go back when focused on a card
        this.controls.on('goBack', () => {
          this.goBackToNavigation();
        });

        this.scene.add(this.cardsCloud.mesh);
        this.scene.add(this.directionalLight);
        this.scene.add(this.pointerLight);
        this.scene.add(this.pointer.group);
        this.scene.add(this.birds.mesh);
        this.scene.add(this.forest.mesh);
        this.renderer.animate( this.render.bind(this) );

        // Display skip button
        this.ui.intro.displaySkipButton();

        // Display app intro on preintro end
        if(config.intro.active) {
          this.ui.intro.on("pre-intro:end", () => {
            this.ui.intro.hidden = false;
          });
        } else {
          this.ui.intro.hidden = false;
        }
      }
    );
  }

  generateMonuments() {
    this.monuments = monuments.map(params => {
      var monument = new Monument(params);
      monument.load()
        .then(monument => this.scene.add(monument.object))
        .catch(error => { throw error; });

      return monument;
    })
  }

  focusOnCard(event) {

    // if currently has an active marker
    if(this.cardMarkersManager.activeMarker) return;

    const tCard = event.card;
    const cardPos = tCard.marker.mesh.position;
    const cameraPos = this.camera.position.clone();

    // disable pointer hover mode
    this.pointer.hover = false;

    // set last camera pos
    this.controls.prevCameraPos = cameraPos;

    // set clicked card active
    tCard.active = true;
    this.cardMarkersManager.activeMarker = tCard.marker;

    // get card direction point
    var dirPos = new THREE.Vector3();
    var direction = tCard.marker.mesh.getWorldDirection(dirPos);
    dirPos = cardPos.clone().add(direction.multiplyScalar(-45));

    // get distance and set duration from distance
    var dist = cameraPos.distanceTo( dirPos );

    // set animation duration from distance from 1 to 5s
    const camAnimDuration = THREE.Math.clamp(dist * 10, 800, 3000);

    // active state focus
    this.controls.focusState = true;

    // clicked on marker
    this.clickedOnMarker = true;

    // add to collection
    this.collection.addCard(tCard);
    tCard.collected = true;


    // animate camera position
    this.controls.move({
      target: dirPos,
      duration: camAnimDuration,
      onFinish: null
    });

    // animate camera lookAt
    this.controls.lookAt({
      target: cardPos,
      duration: camAnimDuration,
      onFinish: null
    });
  }

  /**
   * Set camera and controls back to map navigation
   */
  goBackToNavigation() {
    console.log('goBackToNavigation');
    // move back to last camera pos
    this.controls.move({
      target: this.controls.prevCameraPos,
      duration: 1500,
      onFinish: () => {
        this.controls.prevCameraPos = null;
      }
    });

    // keep look at on card
    this.controls.lookAt({
      target: this.cardMarkersManager.activeMarker.mesh.position,
      duration: 1500,
      onFinish: () =>  {
        // remove focus state
        this.controls.focusState = false;
        // allow go back event to be init again
        this.controls.goBackTriggered = false;

        // make active marker fade away
        this.cardMarkersManager.activeMarker.fadeAway({
          duration: 1200,
          onFinish: () => {
            // reset active marker
            this.cardMarkersManager.activeMarker = null;
          }
        });
      }
    });

  }


  // -----------------------------------------

  /**
   * THREE.js raf
   */
  render() {
    this.clock.update();
    this.ui.compass.update();
    this.cardMarkersManager.update(this.mouseHasClick, this.mouseHasMove, this.clock.delta);

    // this.cloud.material.uniforms.u_time.value = this.clock.elapsed*0.001;
    // this.cloud.material.uniforms.needsUpdate = true;

    if(this.birds) this.birds.render(this.clock.elapsed/1000);
    this.cardsCloud.render(this.clock.elapsed);
    document.body.style.cursor = this.cardsCloud.pixelPicking.cardSelected ? 'pointer' : null;

    if( config.control.type == config.control.CUSTOM ){
      this.controls.update( this.mouseHasMove, this.clock.delta );
    } else if( config.control.type == config.control.FPS ){
      this.controls.update( this.clock.delta/1000 );
    }

    if( !this.clickedOnMarker && (this.mouseHasMove || this.mouseHasClick || (this.controls.movement && this.controls.movement.active)) ){
      this.raycaster.setFromCamera( this.mouse, this.camera );
      var intersects = this.raycaster.intersectObjects( this.scene.children );
      intersects.find(intersect => {
        if( intersect.object.name !== 'floor' ) return false;
        if( config.control.type == config.control.CUSTOM && this.mouseHasClick ) {
          this.controls.onMouseClick( intersect );
        }
        this.pointer.move( intersect.point );
        return true;
      });
    }

    this.pointer.render(this.clock.elapsed);
    // this.renderer.render( this.scene, this.camera );
    this.postProcessing.render(this.scene, this.camera);
    this.mouseHasMove = false;
    this.mouseHasClick = false;
    this.clickedOnMarker = false;
  }


  // -----------------------------------------

  updateMousePosition( event ) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    this.mouseHasMove = true;
    this.mouseHasMoveSinceMouseDown = true;
  }

  onMouseDown( event ){
    if( event.target.nodeName != "CANVAS" ) return;
    this.pointer.click = true;
    if( config.control.type == config.control.CUSTOM ) {
      this.controls.onMouseDown(event);
    }
    this.click = Date.now();
    this.mouseHasMoveSinceMouseDown = false;
  }

  onMouseUp( event ){
    if( event.target.nodeName != "CANVAS" ) return;
    this.pointer.click = false;
    if( config.control.type == config.control.CUSTOM ) {
      this.controls.onMouseUp(event);
    }
    if( !this.mouseHasMoveSinceMouseDown ) {
      this.mouseHasClick = true;
    }
  }

  onWindowResize() {
  	this.camera.aspect = window.innerWidth / window.innerHeight;
  	this.camera.updateProjectionMatrix();
  	this.postProcessing.setSize( window.innerWidth, window.innerHeight );
  }

  export(){
    var exporter = new THREE.OBJExporter();
    this.map.tiles.forEach(tile => {
      if( tile.tile.obj_url == "06.obj.drc" ){
        var result = exporter.parse(tile.mesh);
        document.body.innerHTML = result;
      }
    })
  }
}
