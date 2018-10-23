import Event from "./../../helpers/Event.js";
import Burger from "./Burger.js";

export default class Navigation extends Event {

  constructor(element) {
    super();
    this.eventsList = ['update', 'open', 'close'];
    this.burger = Burger.init();
    this._count = 0;
    this.initElements(element);
    this.initEvents();
  }

  get hidden() {
    return this.elements.menu.classList.contains('menu--hidden');
  }

  set hidden(v) {
    this.elements.menu.classList[v ? 'add' : 'remove']('menu--hidden');
    this.elements.burger.classList[v ? 'add' : 'remove']('counter--hidden');
  }

  initEvents(){
    this.burger.on("click", (event)=>{
      this.hidden = event.open;
      if( this.hidden ){
        this.dispatch("close");
      } else {
        this.dispatch("open");
      }
      console.log("dispatch", this.hidden)

      this.dispatch("update");
    })
  }

  initElements(element) {
    this.element = element;
    this.elements = {
      burger: this.element.querySelector(".burger"),
      menu: this.element.querySelector(".menu")
    }
  }

  static init() {
    return new this(document.querySelector(".navigation"));
  }
}
