import Event from "./../../helpers/Event.js";


export default class Card extends Event {

  constructor(element) {
    super();
    this.initElements(element);
  }

  get hidden() {
    return this.element.classList.contains('card--hidden');
  }

  set hidden(v) {
    this.element.classList[v ? 'add' : 'remove']('card--hidden');
  }

  initElements(element) {
    this.element = element;
    this.elements = {
      title: this.element.querySelector(".card__title"),
      subtitle: this.element.querySelector(".card__subtitle"),
      img: this.element.querySelector(".card__img")
    }
  }

  static init() {
    return new this(document.querySelector(".card"));
  }
}
