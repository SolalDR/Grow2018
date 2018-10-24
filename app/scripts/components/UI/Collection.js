import Event from "./../../helpers/Event.js";
import Counter from "./Counter";

export default class Collection extends Event {

  constructor(element) {
    super();
    this.counter = Counter.init();
    this.cards = [];
    this.initElements(element);
    this.initEvents();
  }

  get hidden() {
    return this.element.classList.contains('collection--hidden');
  }

  set hidden(v) {
    this.element.classList[v ? 'add' : 'remove']('collection--hidden');
  }

  addCardElement(card){
    var step = 100/8;
    var width = 60;
    var height = 60/(14/9);

    var element = document.createElement("div");
    element.classList.add("collection__item");

    var imgElement = document.createElement("img");
    imgElement.classList.add("collection__img");
    imgElement.src = "/static/images/img_recto.jpg";
    imgElement.style.top = -card.coords.y*height+"px";
    imgElement.style.left = -card.coords.x*width+"px";

    element.appendChild(imgElement);

    this.elements.list.appendChild(element);
    this.elements.cards.push(element);
  }

  addCard(card){
    this.addCardElement(card);
    this.cards.push(card);
  }

  initElements(element) {
    this.element = element;
    this.elements = {
      cards: [],
      list: this.element.querySelector(".collection__list")
    }
  }

  initEvents(){
    this.counter.on("click", ()=>{
      if( this.cards.length > 0 ){
        this.hidden = !this.hidden;
        this.counter.active = !this.hidden;
      }
    })
  }

  static init() {
    return new this(document.querySelector(".collection"));
  }
}
