class Collection {

  constructor({
    cards = []
  }){
    this.storage = window.localStorage;
  }

  addCard(card){
    this.cards.push(card);
    this.saveStorage();
  }

  getStorage(){

  }

  saveStorage(){
    var datas = [];
    this.cards.forEach(card => datas.push(card.ID));
    this.storage.setItem("cards", JSON.parse(datas))
  }

}

export default Collection;
