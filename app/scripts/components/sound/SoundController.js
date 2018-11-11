import {Howl, Howler} from "howler";
import SoundSpatializer from "./SoundSpatializer";
import datas from "./../../../datas/sounds.json";

export default class SoundController {
  constructor(camera, toggler){
    this.toggler = toggler;

    this.mute();

    this.spatializer = new SoundSpatializer({
      controller: this,
      camera,
      distance: 1500
    });

    this.sounds = {};
    for(let i in datas ) this.sounds[i] = new Howl(datas[i])

    this.spatializer.addDistanceConstraint({
      name: "sky",
      factor: new THREE.Vector3(0, 1, 0),
      values: [450, 1500],
      volume: 0.1
    });

    this.spatializer.addDistanceConstraint({
      name: "city",
      factor: new THREE.Vector3(0, 1, 0),
      values: [1050, 0],
      volume: 0.1
    });

    this.toggler.addEventListener('click', () => this.toggle());
  }

  getSound(name){
    if( this.sounds[name] ) return this.sounds[name];
    return null;
  }

  play(name){
    this.sounds[name].play();
  }

  mute() {
    Howler.volume(0);
    this.toggler.classList.remove('sound--unmuted');
    this.toggler.classList.add('sound--muted');
    this.muted = true;
  }

  unmute() {
    Howler.volume(1);
    this.toggler.classList.remove('sound--muted');
    this.toggler.classList.add('sound--unmuted');
    this.muted = false;
  }

  toggle() {
    this[this.muted ? 'unmute' : 'mute']();
  }

  render(){
    this.spatializer.render();
  }
}
