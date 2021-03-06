import Event from "./../helpers/Event.js";
import animationEnd from "./../helpers/AnimationEnd.js";
import Intro from "./UI/Intro.js";
import Compass from "./UI/Compass.js";
import Counter from "./UI/Counter.js";
import Dev from "./UI/Dev.js";
import Navigation from "./UI/Navigation.js";
import Collection from "./UI/Collection.js";
import Instruction from "./UI/Instructrion";
import Card from "./UI/Card";

/**
 * Manage user interface interaction
 */
class UI extends Event {
  constructor(app) {
    super();
    this.eventsList = ["load", "intro:begin", "intro:end"];
    this.initComponents(app);
    this.initEvents();
    this.fullScreenClickHandler();
  }

  initComponents(app) {
    this.intro = Intro.init(app);
    this.compass = Compass.init(app);
    this.dev = Dev.init(app);
    this.navigation = Navigation.init(app);
    this.card = Card.init();
    this.collection = Collection.init(this.card);
    this.instruction = Instruction.init();

    // Trigger in App.js
    this.on("intro:end", ()=>{
      this.compass.hidden = false;
      this.collection.counter.hidden = false;
      this.navigation.burger.hidden = false;
      this.instruction.hidden = false;
    })

    this.navigation.on("update", ()=>{
      if( this.navigation.hidden ){
        this.compass.hidden = false;
        this.collection.counter.hidden = false;
      } else {
        this.compass.hidden = true;
        this.collection.counter.hidden = true;
      }
    })
  }

  initEvents() {
    this.intro.on('hide', () => this.dispatch('intro:begin'));
  }

  fullScreenClickHandler() {
    var docEl = document.documentElement;
    var btn = document.querySelector('.fullscreen-btn');
    btn.addEventListener('click', () => {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    });
  }
}

export default UI;
