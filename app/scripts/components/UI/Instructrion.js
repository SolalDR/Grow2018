class Instruction {
  constructor(element) {
    this._activeItem = null;
    this._icon = null;
    this.textDuration = 5000;
    this.initElements(element)
  }

  get hidden() {
    return this.element.classList.contains('instruction--hidden');
  }

  set hidden(v) {
    this.element.classList[v ? 'add' : 'remove']('instruction--hidden');
    if(!v) this.autoScroll();
  }

  set activeItem(item) {
    this.elements.items.forEach((item) => item.classList.remove('instruction__item--active'))
    item.classList.add('instruction__item--active');
    this.icon = item.dataset.instructionIcon
    this._activeItem = item;
  }

  get activeItem() {
    return this._activeItem;
  }

  set icon(name) {
    let icon;
    if (name.includes('pointer')) {
      icon = Array.from(this.elements.icons).filter(item => item.classList.contains('instruction__icon--pointer'))[0];
      if( name.includes('click') ) {
        icon.dataset.anim = 'click';
      } else if ( name.includes('drag') ) {
        icon.dataset.anim = 'drag';
      }
    } else if ( name.includes('postcard') ) {
        icon = Array.from(this.elements.icons).filter(item => item.classList.contains('instruction__icon--card'))[0];
        icon.dataset.anim = 'reveal';
    }
    if(icon) {
      this.elements.icons.forEach((item) => item.classList.remove('instruction__icon--active'))
      icon.classList.add('instruction__icon--active');
      this._icon = icon;
    }
  }

  get icon() {
    return this._icon;
  }

  initElements(element) {
    this.element = element;
    this.elements = {
      items: this.element.querySelectorAll('.instruction__item'),
      icons: this.element.querySelectorAll('.instruction__icon')
    };
  }

  /**
   * Auto scroll instructions texts
   */
  autoScroll() {

    this.elements.items.forEach((item, key) => {
      item.timeOut = setTimeout(() => {
        this.activeItem = item;
      }, this.textDuration * key)
    })

    // auto hide at the end
    setTimeout(() => {
      this.hidden = true;
      this.resetAutoScroll();
    }, this.textDuration * this.elements.items.length)
  }

  /**
   * Reset auto scroll
   */
  resetAutoScroll() {
    this.elements.items.forEach((item) => clearTimeout(item.timeOut))
  }

  static init() {
    return new this(document.querySelector('.instruction'));
  }
}

export default Instruction;
