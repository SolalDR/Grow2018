import Event from "./../../helpers/Event.js";

export default class Dev extends Event {
  constructor() {
    super();
    this.eventsList = ['enable', 'disable'];
    this.initElements(document.body);
    this.initEvents();
  }

  get hidden() {
    return document.body.classList.contains('mode--developper');
  }

  set hidden(v) {
    document.body.classList[v ? 'add' : 'remove']('mode--developper');
  }

  initElements(element) {
    this.element = element;
  }

  initEvents() {
    this.element.addEventListener("keypress", (e)=>{
      if( e.key == "d" ) this.hidden = !this.hidden;
    });
  }

  static init() {
    return new this();
  }
}
