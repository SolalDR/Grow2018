import Event from "./../../helpers/Event.js";

export default class Intro extends Event {
  constructor(element) {
    super();
    this.eventsList = ['hide'];
    this.initElements(element)
    this.initEvents();
  }

  get hidding() {
    return this.element.classList.contains('intro--hidding');
  }

  set hidding(v) {
    this.element.classList[v ? 'add' : 'remove']('intro--hidding');
  }

  get hidden() {
    return this.element.classList.contains('intro--hidden');
  }

  set hidden(v) {
    var className = this.hidding ? "intro--hidding" : "intro--hidden"
    this.element.classList[v ? 'add' : 'remove'](className);
  }


  hide() {
    this.hidden = !(this.hidding = true);
    setTimeout(() => {this.hidden = !(this.hidding = false); }, 2000);
    this.dispatch('hide');
  }

  initElements(element) {
    this.element = element;
    this.elements = {
      start: this.element.querySelector('.intro__start')
    };
  }

  initEvents() {
    this.elements.start.addEventListener('click', () => this.hide());
  }

  static init() {
    return new this(document.querySelector('.intro'));
  }
}
