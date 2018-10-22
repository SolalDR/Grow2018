import Event from "./../../helpers/Event.js";

export default class Burger extends Event {

  constructor(element) {
    super();
    this.eventsList = ['click'];
    this._count = 0;
    this.initElements(element);
    this.initEvents();
  }

  get hidden() {
    return this.element.classList.contains('burger--hidden');
  }

  set hidden(v) {
    this.element.classList[v ? 'add' : 'remove']('burger--hidden');
  }

  get open() {
    return !this.element.classList.contains('burger--close');
  }

  set open(v) {
    this.element.classList[v ? 'remove' : 'add']('burger--close');
  }

  initEvents(){
    this.element.addEventListener("click", () => {
      this.open = !this.open;
      this.dispatch("click", { open: this.open })
    })
  }

  initElements(element) {
    this.element = element;
  }

  static init() {
    return new this(document.querySelector(".burger"));
  }
}
