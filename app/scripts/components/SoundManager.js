import * as Tone from "tone";

class SoundManager {
  constructor(){
    this.city = new Tone.Player("/static/sounds/ambiance_city.mp3").toMaster();
    this.sky = new Tone.Player("/static/sounds/ambiance_sky.mp3").toMaster();
    this.move = new Tone.Player("/static/sounds/move.mp3").toMaster();

  }
}

export default SoundManager;
