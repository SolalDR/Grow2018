import Dat from "dat.gui";
import {Howler} from "howler";

import CustomControl from "./helpers/CustomControl.js";
import Clock from "./helpers/Clock.js";
import config from "./config.js";
import monuments from "./../datas/monuments.json";
import datas from "./../datas/datas.json";
import Card from "./components/Card.js";
import CardsCloud from "./components/CardsCloud.js";
import ImageUtil from "./helpers/ImageUtil.js";
import Map from "./components/Map.js";
import AppGui from "./AppGui.js";
import Bird from "./components/Bird.js";
import Forest from "./components/Forest.js";
import UI from "./components/UI.js";
import Pointer from "./components/Pointer.js";
import CardMarkersManager from "./components/CardMarkersManager";
import Monument from "./components/Monument";
import Collection from "./components/Collection";
import PostProcessing from "./components/PostProcessing.js";
import promiseLoadTextures from "./helpers/PromiseLoadTextures";

import "./helpers/OBJExporter";
import SoundController from "./components/sound/SoundController";
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
    this.soundController = new SoundController(this.camera);

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

    this.postProcessing = new PostProcessing(this.renderer, this.gui);
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
    this.controls = new CustomControl(this.camera, {
      boundaries: new THREE.Box3(
        new THREE.Vector3( config.control.boundaries.minimum.x, config.control.boundaries.minimum.y, config.control.boundaries.minimum.z ),
        new THREE.Vector3( config.control.boundaries.maximum.x, config.control.boundaries.maximum.y, config.control.boundaries.maximum.z )
      ),
      mouse: this.mouse,
      phi: config.camera.phi,
      scene: this.scene
    });

    this.controls.enabled = false;

    this.controls.on("move", (anim)=>{
      if( anim.duration < 2000 ){
        this.soundController.play("move");
      }
    })

    this.controls.on("focus:ready", ()=>{
      this.renderer.domElement.style.cursor = "pointer";
    })

    this.controls.on("focus:end", ()=>{
      this.pointer.visible = true;
      this.renderer.domElement.style.cursor = "none";
      this.pointer.cursor = "none";
    })
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
    this.pointer = new Pointer(this.renderer.domElement);

    this.map = new Map(this.scene, this.raycaster, this.gui);
    this.map.on("load", ()=>{
      this.birds = new Bird({
        count: 200,
        bbox: this.map.bbox,
        scale: 4
      });
      this.birds.mesh.position.set(-40, 400, 100);
      this.forest = new Forest({ map: this.map })
      this.forest.on("load", ()=>{
        this.generateCards();
        this.generateMonuments();
      })
    });

    this.ui.on("intro:begin", ()=>{
      var target = new THREE.Vector3(this.camera.position.x, 200, this.camera.position.z);
      if(this.config.control.type === this.config.control.CUSTOM) {
        this.controls.rotate({ phi: this.controls.computedPhi(target.y), duration: 5000});
        this.controls.move({ target: target, duration: 5000}).on("end", () => {
          this.controls.enabled = true;
          this.ui.dispatch("intro:end");
          this.cardsCloud.mesh.visible = false;
        });
      }
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
          textures: { recto: recto, verso: verso },
          scene: this.scene,
          pointer: this.pointer
        });

        // set ui compass
        this.ui.compass.targetCard = this.collection.getRandomTarget();
        this.collection.on("addCard", () => this.ui.compass.targetCard = this.collection.getRandomTarget());
        this.cardMarkersManager.on("hover", () => this.pointer.hover = true );
        this.cardMarkersManager.on("hover:end", () => this.pointer.hover = false );
        this.cardMarkersManager.on("click", this.focusOnCard.bind(this));

        this.scene.add(this.cardsCloud.mesh);
        this.scene.add(this.directionalLight);
        this.scene.add(this.pointerLight);
        this.scene.add(this.pointer.group);
        this.scene.add(this.birds.mesh);
        this.scene.add(this.forest.mesh);
        this.renderer.setAnimationLoop( this.render.bind(this) );

        // Display skip button
        this.ui.intro.displaySkipButton();

        // Display app intro on preintro end
        if(config.intro.active) {
          this.ui.intro.on("pre-intro:end", () => {
            this.ui.intro.hidden = false;
            Howler.volume(1);
          });
        } else {
          this.ui.intro.hidden = false;
        }

        // TODO ; remove
        this.initCardToPointer();
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
    if(this.cardMarkersManager.activeMarker) return;
    this.pointer.hover = false;
    this.pointer.visible = false;
    this.cardMarkersManager.activeMarker = event.card.marker;
    this.controls.focus(event.card, this.cardMarkersManager);
    this.clickedOnMarker = true;
    this.collection.addCard(event.card);
  }


  // -----------------------------------------

  /**
   * THREE.js raf
   */
  render() {
    this.clock.update();
    this.ui.compass.update();
    this.cardMarkersManager.update(this.mouseHasClick, this.mouseHasMove, this.clock.delta);

    if(this.birds) this.birds.render(this.clock.elapsed/1000);
    this.cardsCloud.render(this.clock.elapsed);

    if( config.control.type == config.control.CUSTOM ){
      this.controls.update( this.mouseHasMove, this.clock.delta );
    } else if( config.control.type == config.control.FPS ){
      this.controls.update( this.clock.delta/1000 );
    }

    // If no marker is clicked and mouse has moved or clicked or a controls is moving
    if( !this.clickedOnMarker  && ( this.mouseHasMove || this.mouseHasClick || this.controls._move )){

      this.raycaster.setFromCamera( this.mouse, this.camera );

      // Intersect active card
      if( this.controls.isFocus && this.cardMarkersManager.activeMarker ) {
        var intersects = this.raycaster.intersectObjects( [this.cardMarkersManager.activeMarker.mesh] );
        this.pointer.cursor = "zoom-out";
        if( intersects[0] && intersects[0].object.name === this.cardMarkersManager.activeMarker.mesh.name ){
          // Notice raycasting
          this.pointer.cursor = "grab";
          this.controls.onMouseCast( intersects[0], this.mouseHasClick, true );
        }
      } else {
        // Intersects floor
        var intersects = this.raycaster.intersectObjects( this.map.floor.children );
        intersects.find(intersect => {
          // If intersect is not floor or active marker, return
          if( intersect.object.name.match("floor") ){
            this.pointer.move( intersect.point );
            this.controls.onMouseCast( intersect, this.mouseHasClick, false );
          }
          return true;
        });
      }
    }

    // if mouse has click notice controls
    if( this.mouseHasClick ){
      this.controls.onMouseClick();
    }

    this.soundController.render();

    this.pointer.render(this.clock.elapsed);
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

  // DEBUG
  // TODO: remove
  // DEBUG METHOD
  initCardToPointer() {
    this.targetMesh = {
      name: '',
      mesh: null
    }
    // listener
    document.addEventListener("keydown", (event) => {
      if(event.keyCode === 192) {
        this.targetMesh.mesh = this.scene.getObjectByName(this.targetMesh.name);
        if(this.targetMesh.mesh) {
          // update this.targetMesh.mesh pos
          this.targetMesh.mesh.position.copy(this.pointer.position);
          // update data
          var cardData = Array.from(datas).filter((card) => this.targetMesh.name.includes(card.title))[0];
          cardData.position = {
            x: this.targetMesh.mesh.position.x,
            y:0, z:
            this.targetMesh.mesh.position.z
          }

        } else {
          console.log('mesh', this.targetMesh.name, 'not found');
        }
      }
    });
    // gui
    var markers = this.gui.addFolder("markers");
    markers.add(this.targetMesh, "name");
  }

  exportCards() {
    //Get the file contents
    //var txtFile = "markers.json";
    //var file = new File(txtFile);
    var str = JSON.stringify(datas);
    //Save the file contents as a DataURI
    var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(str);
    //document.getElementById('marker-export-link').setAttribute('href', dataUri);

    var iframe = '<iframe src="' + dataUri + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
    var x = window.open();
    x.document.open();
    x.document.write(iframe);
    x.document.close();
  }

  updateRotations() {
    // update data
    var cardData = Array.from(datas).filter((card) => this.targetMesh.name.includes(card.title))[0];
    if(!cardData) return;
    cardData.rotation = {
      x: 0,
      y: this.targetMesh.mesh.rotation.y,
      z: 0
    }
  }

}
