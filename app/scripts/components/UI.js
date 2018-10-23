import Event from "./../helpers/Event.js";
import animationEnd from "./../helpers/AnimationEnd.js";
import Intro from "./UI/Intro.js";
import Compass from "./UI/Compass.js";
import Counter from "./UI/Counter.js";
import Dev from "./UI/Dev.js";
import Navigation from "./UI/Navigation.js";
import Collection from "./UI/Collection.js";

/**
 * Manage user interface interaction
 */
class UI extends Event {
  constructor(app) {
    super();
    this.eventsList = ["load", "intro:begin", "intro:end"];
    this.initComponents(app);
    this.initEvents();
  }

  initComponents(app) {
    this.intro = Intro.init(app);
    this.compass = Compass.init(app);
    this.dev = Dev.init(app);
    this.navigation = Navigation.init(app);
    this.collection = Collection.init(app);

    // Trigger in App.js
    this.on("intro:end", ()=>{
      this.compass.hidden = false;
      this.collection.counter.hidden = false;
      this.navigation.burger.hidden = false;
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
}

export default UI;
