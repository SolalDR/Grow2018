
import OrbitControls from "./helpers/OrbitControls.js";
import Dat from "dat-gui";
import { Stats } from "three-stats";
import Clock from "./helpers/Clock.js";
import config from "./config.js";
import datas from "./../datas/datas.json";
import Card from "./components/Card.js";
import CardsCloud from "./components/CardsCloud.js";
import ImageUtil from "./helpers/ImageUtil.js";
import EffectComposer from "./components/EffectComposer.js";
import Map from "./components/Map.js";
import countries from "./../datas/countries.json"

import * as maptalks from 'maptalks';
import { ThreeLayer } from 'maptalks.three';


export default class App {


    constructor() {

        // Events
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        // document.body.addEventListener("click", this.updateMousePosition.bind(this), false);
        document.body.addEventListener("mousemove", this.updateMousePosition.bind(this), false);

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
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.00001, 20000 );
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
        this.raycaster = new THREE.Raycaster();

        this.scene = new THREE.Scene();
        var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
        this.scene.add(light)
        this.map = new Map(this.scene);
        // this.initComposer();
        this.generateMap();

        // Init Clock
        this.clock = new Clock();
        this.stats = new Stats();
        this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom );

        this.onWindowResize();
        this.gui.add(this.config.world, "timeFactor", 0, 0.0001);

        this.renderer.animate( this.render.bind(this) );
    }

    initComposer(){
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.setSize(window.innerWidth, window.innerHeight);

        this.sepiaPass = new THREE.ShaderPass( THREE.SepiaShader );
        this.fadePass = new THREE.ShaderPass( THREE.CornerFadeShader );
        this.fxaaPass = new THREE.ShaderPass( THREE.FxaaShader );

        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

        this.sepiaPass.uniforms[ "amount" ].value = 0.9;
        this.fadePass.uniforms[ "amount" ].value = 0.9;
        // this.sepiaPass.renderToScreen = true;
        // this.fadePass.renderToScreen = true;
        this.fxaaPass.renderToScreen = true;

        this.fxaaPass.material.uniforms.resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
        // this.composer.addPass(this.sepiaPass);
        // this.composer.addPass(this.fadePass);
        this.composer.addPass(this.fxaaPass);


        this.gui.add(this.sepiaPass.uniforms[ "amount" ], "value", 0, 1).name("Sepia");
    }


    generateMap() {
    }


    // -----------------------------------------


    render() {
        this.stats.begin();
        this.clock.update();

        // this.cardsCloud.render(this.clock.elapsed);

        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera( this.mouse, this.camera );

        // calculate objects intersecting the picking ray
        var intersects = this.raycaster.intersectObjects( this.scene.children );
        // console.log(this.mouse);
        for ( var i = 0; i < intersects.length; i++ ) {
            // console.log(intersects) ;
            // this.cardsCloud
        }

        this.renderer.render( this.scene, this.camera );

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
