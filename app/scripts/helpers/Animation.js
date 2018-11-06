import easing from "./Easing"
import Event from "./Event"

export default class Animation extends Event {

  constructor(args){
    super();
    this.eventsList = ["start", "end", "progress"];

    this.start = false;
    this.ended = false;

    this.current = 0

    this.from = args.from ? args.from : 0;
    this.to = args.to != null ? args.to : 1;

    this.speed = args.speed ? args.speed : 0.01;
    this.duration = args.duration ? args.duration : 1000;

    if( args.speed ){
      this.duration = (Math.abs(this.to - this.from) / args.speed) * 16;
    }

    this.timingFunction = args.timingFunction && easing[args.timingFunction] ? easing[args.timingFunction] : easing["linear"];
  }

  render(delta){
    if( this.ended ) return;
    if( !this.isStart ){
      this.isStart = true;
      this.dispatch("start");
    }

    this.current += delta;
    this.advancement = this.timingFunction(Math.min(1., this.current/this.duration));
    var value = this.from + (this.to - this.from) * this.advancement;

    this.dispatch("progress", { advancement: this.advancement, value, animation: this });

    if( this.advancement === 1 ) {
      this.ended = true;
      this.dispatch("end");
    }

    return this.advancement;
  }
}
