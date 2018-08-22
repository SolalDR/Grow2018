
import OrbitControls from "./helpers/OrbitControls.js";
import Dat from "dat-gui";
import { Stats } from "three-stats";
import Clock from "./helpers/Clock.js";
import config from "./config.js";
import datas from "./../datas/datas.json";
import Card from "./components/Card.js";
import CardsCloud from "./components/CardsCloud.js";


export default class App {


    constructor() {

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        document.body.addEventListener("click", this.updateMousePosition.bind(this), false);
        
        this.config = config;
        this.gui = new Dat.GUI();

        // Init
        this.container = document.querySelector( '#main' );
    	document.body.appendChild( this.container );
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setClearColor ( 0xEEEEEE, 1 )
        this.container.appendChild( this.renderer.domElement );

        // Camera and control
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.00001, 1000 );
        this.camera.position.set(
            config.camera.position.x, 
            config.camera.position.y, 
            config.camera.position.z
        );

        this.controls = new OrbitControls( this.camera );
        this.controls.maxZoom = 50; 
        this.controls.minZoom = 50; 
        // this.controls.enabled = false;
        this.mouse = new THREE.Vector2();

        this.generateCards();

        // Init Clock
        this.clock = new Clock();
        this.stats = new Stats();
        this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );

    	this.scene = new THREE.Scene();       
        this.scene.add(this.cardsCloud.mesh);

        this.onWindowResize();
        this.renderer.animate( this.render.bind(this) );

        this.gui.add(this.config.world, "timeFactor", 0, 0.0001);
    }


    generateCards() {
        var cards = [], card;
        datas.forEach(data => {
            card = new Card(data);
            if( card.isWorking ){
                cards.push(card);
            }
        });

        console.log(cards);
        this.cardsCloud = new CardsCloud({
            cards,
            gui: this.gui
        });
    }


    // -----------------------------------------


    render() {
        this.stats.begin();
        this.clock.update();

        this.cardsCloud.render(this.clock.elapsed);

    	this.renderer.render(this.scene, this.camera);
        this.stats.end();
    }


    // -----------------------------------------


    updateMousePosition( event ) { 
        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }


    onWindowResize() {
    	this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight );
    }


}
