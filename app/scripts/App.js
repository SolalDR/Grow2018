import OrbitControls from "./helpers/OrbitControls.js";
import FirstPersonControls from "./helpers/FirstPersonControls.js";
import CustomControl from "./helpers/CustomControl.js";
import Dat from "dat-gui";
import Clock from "./helpers/Clock.js";
import config from "./config.js";
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
import Collection from "./components/Collection";

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
    this.onWindowResize();

    this.init();
    this.initControl();

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
          boundaries: new THREE.Box3(new THREE.Vector3(-1000, 200, -1000), new THREE.Vector3(1000, 2000, 1000)),
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

    this.collection = new Collection();

    // this.water = new Water();
    // this.scene.add(this.water.mesh);

    this.map = new Map(this.scene, this.raycaster);
    this.map.on("map:load", ()=>{
      this.birds = new Bird({
        count: 200,
        bbox: this.map.bbox,
        scale: 4
      });
      this.birds.mesh.position.set(-40, 400, 100);
      this.scene.add(this.birds.mesh);

      this.forest = new Forest({ map: this.map })
      this.forest.on("load", ()=>{
        this.scene.add(this.forest.mesh);
      })
    });

    this.generateCards();

    // TODO: remove

    AppGui.init(this);

    this.ui.on("intro:begin", ()=>{
      var target = new THREE.Vector3(0, 200, 0);
      this.controls.move({
        target: target,
        duration: 5000,
        onFinish: () => { console.log("Hello end"); this.ui.dispatch("intro:end") }
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
    // var verso = new THREE.TextureLoader().load("/static/images/img_verso.jpg");
    // var recto = new THREE.TextureLoader().load(
    //   "/static/images/img_recto.jpg",
    //   () => {
    this.promiseLoadTextures(
      [
        '/static/images/img_verso.jpg',
        '/static/images/img_recto.jpg'
      ],
      (textures) => {

        console.log('textures loaded', textures);

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

        this.cardsCloud = new CardsCloud({
          cards,
          gui: this.gui,
          camera: this.camera
        });

        this.cardMarkersManager = new CardMarkersManager({
          cards,
          textures : {
            recto: recto,
            verso: verso
          },
          scene: this.scene,
          pointer: this.pointer
        });
        this.cardMarkersManager.on("click", (card) => {
          this.clickedOnMarker = true;
          this.collection.addCard(card);
        });
        // this.cardMarkersManager.on("hover", (cards) => console.log(cards) );

        this.scene.add(this.cardsCloud.mesh);
        this.renderer.animate( this.render.bind(this) );

        // set ui compass
        this.ui.compass.targetPosition = this.cardMarkersManager.cards[0].marker.mesh.position;
      }
    );
  }


  // -----------------------------------------

  /**
   * THREE.js raf
   */
  render() {
    this.clock.update();
    this.ui.compass.update();
    this.cardMarkersManager.update(this.mouseHasClick, this.mouseHasMove);

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
    this.renderer.render( this.scene, this.camera );
    this.mouseHasMove = false;
    this.mouseHasClick = false;
    this.clickedOnMarker = false;
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


  /**
   * THREE.TextureLoader promise for multiple textures
   * @param {Array} imgUrls - textures images urls
   * @param {Function} callback - callback when all textures loaded
   */
  promiseLoadTextures(imgUrls, callback) {

    var imgPr = [];
    var textures = [];
    //var loader = new THREE.TextureLoader();

    // Load textures
    for (var i = 0; i < imgUrls.length; i++) {
      var url = imgUrls[i];
      imgPr.push(new Promise((resolve, reject) => {
        var loader = new THREE.TextureLoader();
        loader.setCrossOrigin( 'Anonymous');
        var key = i;
        var texture = loader.load( url, () => {
          textures[key] = texture;
          resolve();
        });
      }));
    }

    // Resolve textures loaded
    Promise.all(imgPr).then(() => {
      callback(textures);
      this.texturesLoaded = true;
    }).catch(function(errtextures) {
      console.error(errtextures)
    });
  }

}
