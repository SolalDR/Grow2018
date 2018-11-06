import Event from "./../helpers/Event";

class Collection extends Event {

  constructor({
    cards = [],
    ui = null
  } = {}){
    super();
    this.eventsList = ["addCard"]
    this.ui = ui;
    this.targetsCards = [];
    this.storedCards = [];
    this.cards = {};

    cards.forEach(card => {
      this.cards[card.rank] = card
      this.targetsCards.push(card.rank);
    });

    this.count = 0;
    this.storage = window.localStorage;
  }

  addCard(card){
    if(this.storedCards.indexOf(card.rank) < 0) {
      card.collected = true;
      this.storedCards.push(card.rank);
      var index = this.targetsCards.indexOf(card.rank);
      this.targetsCards.splice(index, 1);

      this.ui.addCard(this.cards[card.rank]);
      this.count++;

      this.dispatch("addCard");
    }
    this.ui.counter.count = this.count;
  }

  getRandomTarget(){
    return this.cards[this.targetsCards[Math.floor(Math.random()*this.targetsCards.length)]];
  }

  saveStorage(){
    var datas = [];
    this.storedCards.forEach(card => datas.push(card.rank));
    this.storage.setItem("cards", JSON.parse(datas))
  }

}

export default Collection;
