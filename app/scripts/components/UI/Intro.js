import Event from "./../../helpers/Event.js";
import config from "../../config";

export default class Intro extends Event {
  constructor(element) {
    super();
    this.eventsList = ['hide', 'pre-intro:end'];
    this.initElements(element);
    this.initEvents();
    this.preIntroEndEvent();
    this.onSkipButtonClick();

    // Hide pre-intro if config set invisible
    if(!config.intro.active) {
      this.preIntroHidden();
    }
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
      start: this.element.querySelector('.intro__start'),
      preIntro: document.body.querySelector('.pre-intro'),
      skipBtn: document.getElementById('skip-btn')
    };
  }

  initEvents() {
    this.elements.start.addEventListener('click', () => this.hide());
  }

  static init() {
    return new this(document.querySelector('.intro'));
  }

  preIntroHidden() {
    this.elements.preIntro.style.display = 'none';
  }

  /**
   * On preintro panel hide, dispatch event preintro end
   */
  preIntroEndEvent() {
    this.elements.preIntro.addEventListener("animationstart", (e) => {
      e.stopPropagation();
      if(e.animationName === 'hide-pre-intro') {
        this.dispatch('pre-intro:end');
      }
    }, false);
  }

  /**
   * display skip button on intro
   */
  displaySkipButton() {
    this.elements.skipBtn.classList.add('visible')
  }

  /**
   * on skip button clicked hide
   */
  onSkipButtonClick() {
    this.elements.skipBtn.addEventListener("click", (e) => {
        this.elements.preIntro.classList.add('pre-intro--hidden');
        this.dispatch('pre-intro:end');
    }, false);
  }
}
