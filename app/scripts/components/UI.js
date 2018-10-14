import Event from "./../helpers/Event.js";
import animationEnd from "./../helpers/AnimationEnd.js";
import Intro from "./UI/Intro.js"
import Compass from "./UI/Compass.js"

/**
 * Manage user interface interaction
 */
class UI extends Event {
  constructor(app) {
    super();
    this.eventsList = ["load", "start"];
    this.initComponents(app);
    this.initEvents();
  }

  initComponents(app) {
    this.intro = Intro.init(app);
    this.compass = Compass.init(app);
  }

  initEvents() {
    this.intro.on('hide', () => this.dispatch('start'));
  }
}

export default UI;
