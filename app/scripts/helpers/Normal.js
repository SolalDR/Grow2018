// Largely inspired by a script created by bluesmoon, using the Marsaglia polar method:
// https://gist.github.com/bluesmoon/7925696

class Normal {
  constructor({amplitude = 1, minimum = -Infinity, maximum = Infinity, maximumCalculationsNumber = 100} = {}) {
    this.spareRandom = null;
    this.amplitude = amplitude;
    this.minimum = minimum;
    this.maximum = maximum;
    this.maximumCalculationsNumber = maximumCalculationsNumber;
  }

  random() {
    var value = null;
    var n = 1;
    var u, v, s, mul;

    while(value === null || value < this.minimum || value > this.maximum) {
      if(++n > this.maximumCalculationsNumber) throw 'Maximum calculations number reached';

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

      value = value/14*this.amplitude + 0.5;
    }

    return value;
  }
}

export default Normal;

