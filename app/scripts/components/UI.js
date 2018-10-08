import Event from "./../helpers/Event.js";
import animationEnd from "./../helpers/AnimationEnd.js";

/**
 * Manage user interface interaction
 */
class UI extends Event {


  constructor(){
    super();
    this.eventsList = ["load", "start"];
    this.elements = {};
    this.elements.intro = document.getElementById("screen-intro");
    this.elements.start = document.getElementById("cta-intro__start");

    this.initEvents();
  }

  initEvents(){
    window.addEventListener("load", ()=>{

    });

    this.elements.start.addEventListener("click", ()=>{
      this.elements.intro.classList.add("intro--hidding");
      setTimeout(() => this.elements.intro.classList.replace("intro--hidding", "intro--hidden"), 2000);
      this.dispatch("start");
    });
  }
}

export default UI;
