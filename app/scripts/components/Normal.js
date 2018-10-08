// Largely inspired by a script created by bluesmoon, using the Marsaglia polar method:
// https://gist.github.com/bluesmoon/7925696

class Normal {
  constructor() {
    this.spareRandom = null;
  }

  random({amplitude = null, minimum = null, maximum = null, integer = false} = {}) {
    var value, u, v, s, mul;

    if(this.spareRandom !== null) {
      value = this.spareRandom;
      this.spareRandom = null;
    }
    else {
      do {
        u = Math.random()*2 - 1;
        v = Math.random()*2 - 1;
        s = u*u + v*v;
      }
      while(s === 0 || s >= 1);

      mul = Math.sqrt(-2*Math.log(s)/s);
      value = u*mul;
      this.spareRandom = v*mul;
    }

    value = value/14 + 0.5;

    if(amplitude !== null) {
      amplitude /= 2;
      minimum = -amplitude;
      maximum = amplitude;
    }

    if(minimum !== null && maximum !== null) {
      value = value*(maximum - minimum) + minimum;
    }

    if(integer) value = Math.round(value);

    return value;
  }
}

export default Normal;
