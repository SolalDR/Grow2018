import Event from "./../../helpers/Event.js";

export default class Counter extends Event {

  constructor(element) {
    super();
    this.eventsList = ['change'];
    this._count = 0;
    this.initElements(element);
  }

  get hidden() {
    return this.element.classList.contains('counter--hidden');
  }

  set hidden(v) {
    this.element.classList[v ? 'add' : 'remove']('counter--hidden');
  }

  get count(){
    return this._count
  }

  set count(count){
    if( this._count != count ){
      this.dispatch("change");
    }
    this._count = count;
    this.elements.count.innerHTML = this._count;
  }

  initElements(element) {
    this.element = element;
    this.elements = {
      count: this.element.querySelector(".counter__count")
    }

    this.elements.count.innerHTML = this.count;
  }

  static init() {
    return new this(document.querySelector(".counter"));
  }
}
