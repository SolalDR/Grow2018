class Collection {

  constructor({
    cards = [],
    ui = null
  } = {}){
    this.ui = ui;
    this.cards = {};
    this.count = 0;
    this.storage = window.localStorage;
  }

  addCard(card){
    if(!this.cards[card.rank]) {
      this.cards[card.rank] = card
      this.ui.addCard(card);
      this.count++;
    }
    this.ui.counter.count = this.count;
  }

  getStorage(){

  }

  saveStorage(){
    var datas = [];
    this.cards.forEach(card => datas.push(card.rank));
    this.storage.setItem("cards", JSON.parse(datas))
  }

}

export default Collection;
