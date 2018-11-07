import {Howl, Howler} from "howler";
import SoundSpatializer from "./SoundSpatializer";
import datas from "./../../../datas/sounds.json";

export default class SoundController {
  constructor(camera){

    this.spatializer = new SoundSpatializer({
      controller: this,
      camera,
      distance: 1500
    });

    this.sounds = {};
    for(let i in datas ) this.sounds[i] = new Howl(datas[i])
    Howler.volume(0);

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
  }

  getSound(name){
    if( this.sounds[name] ) return this.sounds[name];
    return null;
  }

  play(name){
    this.sounds[name].play();
  }

  render(){
    this.spatializer.render();
  }
}
