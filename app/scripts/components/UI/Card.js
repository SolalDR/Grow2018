import Event from "./../../helpers/Event.js";


export default class Card extends Event {

  constructor(element) {
    super();
    this._cardItem =  {};
    this.texturesPaths = {
      recto: '/static/images/img_recto.jpg'
    }
    this.initElements(element);
    this.handleOverlayClick();
  }

  get hidden() {
    return this.element.classList.contains('card--hidden');
  }

  set hidden(v) {
    this.element.classList[v ? 'add' : 'remove']('card--hidden');
  }

  set cardItem(card) {
    this._cardItem = card;
  }

  get cardItem() {
    return this._cardItem;
  }

  initCardImage() {
    //this.elements.img
  }

  updateCard(card) {
    this.cardItem = card;

    if (this.elements.img) {
      this.removeCurrentCard(this.createCard.bind(this));
    } else {
      this.createCard()
    }
  }

  createCard() {

    var width = this.elements.imgCt.offsetWidth;
    var height = width/(14/9);

    // create image
    var imgElement = document.createElement("img");
    imgElement.classList.add("card__img");
    imgElement.src = "/static/images/img_recto.jpg";
    imgElement.style.top = -this.cardItem.coords.y*height+"px";
    imgElement.style.left = -this.cardItem.coords.x*width+"px";

    // append to dom
    this.elements.imgCt.appendChild(imgElement);

    // set current img el
    this.elements.img = imgElement

    // set portrait
    if(this.cardItem.isPortrait) {
      this.elements.imgCt.classList.add('card__img-container--portrait');
    } else {
      this.elements.imgCt.classList.remove('card__img-container--portrait');
    }

    // reveal card panel
    this.hidden = false;

    // reveal card
    this.elements.imgWrapper.classList.add('card__img-wrapper--reveal');
  }

  removeCurrentCard(callback) {
    this.elements.imgWrapper.classList.remove('card__img-wrapper--reveal');
    // on transition end remove current img
    ['webkitTransitionEnd', 'otransitionend', 'oTransitionEnd', 'msTransitionEnd', 'transitionend'].forEach( (evt) => {
        this.elements.img.addEventListener(evt, () => {
          console.log('Class: Card, Function: , Line 85 (): '
            , 'transition end', this.elements.img);
          if(this.elements.img) {
            this.elements.img.parentNode.removeChild(this.elements.img);
            this.elements.img = null;
          }
          if(callback) callback();
        }, false)
    });
    // anim hide img
    this.elements.img.classList.add('card__img--hidden');
  }

  initElements(element) {
    this.element = element;
    this.elements = {
      title: this.element.querySelector(".card__title"),
      subtitle: this.element.querySelector(".card__subtitle"),
      imgWrapper: this.element.querySelector(".card__img-wrapper"),
      imgCt: this.element.querySelector(".card__img-container"),
      overlay: this.element.querySelector(".card__overlay"),
      img: null
    }
  }

  handleOverlayClick() {
    this.element.addEventListener('click', () => {
      this.hidden = true;
      this.removeCurrentCard();
    });
    // prevent click on image
    this.elements.imgCt.addEventListener('click',(e) => {
      e.stopPropagation();
    })
  }

  static init() {
    return new this(document.querySelector(".card"));
  }
}
